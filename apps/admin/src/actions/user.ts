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
import { revalidatePath } from "next/cache";
import "server-only";
import type { z } from "zod";

export async function getAllUsersAction() {
    await checkIfAdmin();

    // strip password from response before it is sent to the client
    return (await getAllUsersDb()).map((user) => ({
        ...user,
        password: "",
    }));
}

export async function setUserActive(id: string, active: boolean) {
    await checkIfAdmin();
    try {
        await setUserActiveDb(id, active);
        if (active) {
            const user = await getUserById(id);
            if (user) {
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
        throw new Error("Failed to set user active");
    }
}

export async function setUserAdmin(id: string, isAdmin: boolean) {
    await checkIfAdmin();

    try {
        await setUserAdminDb(id, isAdmin);
        revalidatePath("/users");
    } catch (e) {
        throw new Error("Failed to set user admin");
    }
}

export async function deleteUser(id: string) {
    await checkIfAdmin();

    try {
        await deleteUserDb(id);
        await deleteSessionsOfUser(id);
        revalidatePath("/users");
    } catch (e) {
        throw new Error("Failed to delete user");
    }
}

export async function updateUser(data: z.infer<typeof baseInformationSchema>, id: string) {
    await checkIfAdmin();

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
        throw new Error("Failed to update user");
    }
}

export async function updateUserState(data: z.infer<typeof userStateSchema>, id: string) {
    await checkIfAdmin();
    const userData = await getUserById(id);
    if (!userData) {
        throw new Error("User not found");
    }

    if (data.experimentStatus === "installation" && !data.installationDate) {
        throw new Error("Installation date is required for installation status");
    }

    if (data.experimentStatus === "deinstallation" && !data.deinstallationDate) {
        throw new Error("Deinstallation date is required for deinstallation status");
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
        throw new Error("Failed to update user");
    }

    if (!userData.isActive && data.isActive) {
        try {
            await sendAccountActivatedEmail({
                to: userData.email,
                name: userData.username,
                from: env.RESEND_API_MAIL,
                apiKey: env.RESEND_API_KEY,
            });
        } catch (err) {
            console.error("Failed to send account activated mail", err);
        }
    }

    // User is not a participant so return early
    // and delete experiment data
    if (!data.isParticipant) {
        if (userData.isParticipant) {
            try {
                await deleteExperimentDataForUser(id);
            } catch {
                throw new Error("Failed to delete experiment data");
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
            throw new Error("Failed to create experiment data");
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
            throw new Error("Failed to update experiment data");
        }
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
            console.error("Failed to send dismissed mail", err);
        }
    }

    // Only send invite mails if they are not getting paid through prolific
    // this is normaly handled by the cron job, but when set manuelly we want to archive the same
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
            console.error("Failed to send invite mail", err);
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
            console.error("Failed to send experiment done mail", err);
        }
    }

    revalidatePath("/users");
}
