"use server";

import { env } from "@/env.mjs";
import { checkIfAdmin } from "@/lib/auth/auth.action";
import type { userStateSchema } from "@/lib/schema/user";
import {
    createExperimentDataForUser,
    deleteExperimentDataForUser,
    deleteSessionsOfUser,
    deleteUser as deleteUserDb,
    getAllUsers as getAllUsersDb,
    getUserById,
    getUserExperimentData,
    logError,
    setUserActive as setUserActiveDb,
    setUserAdmin as setUserAdminDb,
    updateExperimentDataForUser,
    updateLastReportTimestamp,
    updateUser as updateUserDb,
} from "@energyleaf/db/query";
import type { baseInformationSchema } from "@energyleaf/lib";
import {
    sendAccountActivatedEmail,
    sendExperimentDoneEmail,
    sendExperimentRemovedEmail,
    sendSurveyInviteEmail,
} from "@energyleaf/mail";
import { waitUntil } from "@vercel/functions";
import { revalidatePath } from "next/cache";
import "server-only";
import type { z } from "zod";

export async function getAllUsersAction() {
    try {
        await checkIfAdmin();
    } catch (err) {
        return [];
    }

    // strip password from response before it is sent to the client
    return (await getAllUsersDb()).map((user) => ({
        ...user,
        password: "",
    }));
}

export async function setUserActive(id: string, active: boolean) {
    try {
        await checkIfAdmin();
    } catch (err) {
        return {
            success: false,
            message: "Keine Berechtigung.",
        };
    }
    try {
        const activationDate = new Date();
        activationDate.setHours(0, 0, 0, 0);
        await setUserActiveDb(id, active, activationDate);
        if (active) {
            const user = await getUserById(id);
            if (user && env.RESEND_API_MAIL && env.RESEND_API_KEY) {
                await sendAccountActivatedEmail({
                    to: user.email,
                    name: user.username,
                    from: env.RESEND_API_MAIL,
                    apiKey: env.RESEND_API_KEY,
                });
            }

            await updateLastReportTimestamp(id);
        }
        revalidatePath("/users");
    } catch (e) {
        waitUntil(
            logError(
                "user/actived-mail-failed",
                "user-activate",
                "admin",
                {
                    userId: id,
                    active,
                },
                e,
            ),
        );
        return {
            success: false,
            message: `Fehler beim ${active ? "aktivieren" : "deaktivieren"} des Benutzers.`,
        };
    }
}

export async function setUserAdmin(id: string, isAdmin: boolean) {
    try {
        await checkIfAdmin();
    } catch (err) {
        return {
            success: false,
            message: "Keine Berechtigung.",
        };
    }

    try {
        await setUserAdminDb(id, isAdmin);
        revalidatePath("/users");
    } catch (e) {
        return {
            success: false,
            message: "Fehler beim Setzen des Nutzers als Admin.",
        };
    }
}

export async function deleteUser(id: string) {
    try {
        await checkIfAdmin();
    } catch (err) {
        return {
            success: false,
            message: "Keine Berechtigung.",
        };
    }

    try {
        await deleteUserDb(id);
        await deleteSessionsOfUser(id);
        revalidatePath("/users");
    } catch (e) {
        return {
            success: false,
            message: "Fehler beim Löschen des Nutzers.",
        };
    }
}

export async function updateUser(data: z.infer<typeof baseInformationSchema>, id: string) {
    try {
        await checkIfAdmin();
    } catch (err) {
        return {
            success: false,
            message: "Keine Berechtigung.",
        };
    }

    try {
        await updateUserDb(
            {
                firstname: data.firstname,
                lastName: data.lastname,
                username: data.username,
                email: data.email,
                phone: data.phone,
                address: data.address,
            },
            id,
        );
        revalidatePath("/users");
    } catch (e) {
        return {
            success: false,
            message: "Fehler beim Aktualisieren des Nutzers.",
        };
    }
}

export async function updateUserState(data: z.infer<typeof userStateSchema>, id: string) {
    try {
        await checkIfAdmin();
    } catch (err) {
        return {
            success: false,
            message: "Keine Berechtigung.",
        };
    }

    try {
        const userData = await getUserById(id);
        if (!userData) {
            throw new Error("Nutzer nicht gefunden.");
        }

        if (data.experimentStatus === "installation" && !data.installationDate) {
            throw new Error("Installationsdatum angeben.");
        }

        if (data.experimentStatus === "deinstallation" && !data.deinstallationDate) {
            throw new Error("Deinstallationsdatum angeben.");
        }

        try {
            let activeDate: Date | null = null;
            if (!userData.isActive && data.isActive) {
                activeDate = new Date();
                activeDate.setHours(0, 0, 0, 0);
            }
            await updateUserDb(
                {
                    isActive: data.isActive,
                    isAdmin: data.isAdmin,
                    isParticipant: data.isParticipant,
                    appVersion: data.appVersion,
                    activationDate: activeDate,
                },
                id,
            );
        } catch (e) {
            throw new Error("Fehler beim Aktualisieren des Nutzers.");
        }

        if (!userData.isActive && data.isActive && env.RESEND_API_KEY && env.RESEND_API_MAIL) {
            try {
                await sendAccountActivatedEmail({
                    to: userData.email,
                    name: userData.username,
                    from: env.RESEND_API_MAIL,
                    apiKey: env.RESEND_API_KEY,
                });
            } catch (err) {
                waitUntil(
                    logError(
                        "user/actived-mail-failed",
                        "user-state-update",
                        "admin",
                        {
                            userId: userData.id,
                            data,
                        },
                        err,
                    ),
                );
            }
        }

        // User is not a participant so return early
        // and delete experiment data
        if (!data.isParticipant) {
            if (userData.isParticipant) {
                try {
                    await deleteExperimentDataForUser(id);
                } catch {
                    throw new Error("Fehler beim Löschen der Experimentdaten.");
                }
            }
            revalidatePath("/users");
            return;
        }

        const expData = await getUserExperimentData(id);

        // Create experiment data if it does not exist
        // This is the case if we change it afterwards
        if (!expData) {
            try {
                await createExperimentDataForUser({
                    userId: id,
                    experimentStatus: data.experimentStatus,
                    installationDate: data.installationDate || null,
                    deinstallationDate: data.deinstallationDate || null,
                    getsPaid: data.getsPaid,
                });
            } catch (err) {
                throw new Error("Fehler beim Erstellen der Experimentdaten.");
            }
        } else {
            try {
                await updateExperimentDataForUser(
                    {
                        experimentStatus: data.experimentStatus,
                        installationDate: data.installationDate || null,
                        deinstallationDate: data.deinstallationDate || null,
                        getsPaid: data.getsPaid,
                    },
                    id,
                );
            } catch (err) {
                throw new Error("Fehler beim Aktualisieren der Experimentdaten.");
            }
        }

        if (!env.RESEND_API_MAIL || !env.RESEND_API_KEY) {
            return;
        }

        // Send user mails based on expent status
        let name = userData.username;
        if (userData.firstname && userData.lastName && userData.firstname !== "" && userData.lastName !== "") {
            name = `${userData.firstname} ${userData.lastName}`;
        }

        if (data.experimentStatus === "dismissed") {
            try {
                await sendExperimentRemovedEmail({
                    to: userData.email,
                    from: env.RESEND_API_MAIL,
                    apiKey: env.RESEND_API_KEY,
                    name,
                });
            } catch (err) {
                waitUntil(
                    logError(
                        "user/dismissed-mail-failed",
                        "user-state-update",
                        "admin",
                        {
                            userId: userData.id,
                            data: data,
                        },
                        err,
                    ),
                );
            }
        }

        // Only send invite mails if they are not getting paid through prolific
        // this is normaly handled by the cron job, but when set manuelly we want to achieve the same
        if ((data.experimentStatus === "second_survey" || data.experimentStatus === "third_survey") && !data.getsPaid) {
            const number = data.experimentStatus === "second_survey" ? 2 : 3;
            const surveyToken = userData.id.replace(/-_/g, "");
            const surveyId = data.experimentStatus === "second_survey" ? "TODO 1" : "TODO 2";
            const surveyLink = `https://umfragen.uni-oldenburg.de/index.php?r=survey/index&token=${surveyToken}&sid=${surveyId}&lang=de`;
            try {
                await sendSurveyInviteEmail({
                    to: userData.email,
                    from: env.RESEND_API_MAIL,
                    apiKey: env.RESEND_API_KEY,
                    name,
                    surveyNumber: number,
                    surveyLink,
                });
            } catch (err) {
                waitUntil(
                    logError(
                        "user/survey-invite-mail-failed",
                        "user-state-update",
                        "admin",
                        {
                            userId: userData.id,
                            data: data,
                        },
                        err,
                    ),
                );
            }
        }

        // Account is inactive experiment is finished
        if (data.experimentStatus === "inactive") {
            try {
                await sendExperimentDoneEmail({
                    to: userData.email,
                    from: env.RESEND_API_MAIL,
                    apiKey: env.RESEND_API_KEY,
                    name,
                });
            } catch (err) {
                waitUntil(
                    logError(
                        "user/done-mail-failed",
                        "user-state-update",
                        "admin",
                        {
                            userId: userData.id,
                            data: data,
                        },
                        err,
                    ),
                );
            }
        }

        revalidatePath("/users");
    } catch (err) {
        return {
            success: false,
            message: err.message,
        };
    }
}
