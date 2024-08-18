import { env } from "@/env.mjs";
import { getUsersWhoRecieveSurveyMail, logError, trackAction, updateExperimentDataForUser } from "@energyleaf/db/query";
import { sendSurveyInviteEmail } from "@energyleaf/mail";
import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

const sendMails = async (
    date: Date,
    status: "second_survey" | "third_survey",
    surveyId: string,
    surveyNumber: number,
) => {
    if (!env.RESEND_API_KEY || !env.RESEND_API_MAIL) {
        return;
    }
    const firstSurveyUsers = await getUsersWhoRecieveSurveyMail(date);
    for (const firstSurveyUser of firstSurveyUsers) {
        const { user } = firstSurveyUser;

        try {
            await updateExperimentDataForUser(
                {
                    experimentStatus: status,
                },
                user.id,
            );
        } catch (err) {
            waitUntil(
                logError(
                    "survey-routine/experiment-status-update",
                    "survey-routine",
                    "api",
                    { details: { userId: user.id } },
                    err,
                ),
            );
        }

        let name = user.username;

        if (user.firstname && user.lastname && user.firstname !== "" && user.lastname !== "") {
            name = `${user.firstname} ${user.lastname}`;
        }
        const surveyToken = user.id.replace(/[-_]/g, "");
        const surveyLink = `https://umfragen.uni-oldenburg.de/index.php?r=survey/index&token=${surveyToken}&sid=${surveyId}&lang=de`;

        const details = {
            userId: user.id,
            name,
            surveyId,
            surveyNumber,
            surveyToken,
            surveyLink,
            status,
        };

        try {
            await sendSurveyInviteEmail({
                to: user.email,
                from: env.RESEND_API_MAIL,
                apiKey: env.RESEND_API_KEY,
                name,
                surveyNumber,
                surveyLink,
            });
            waitUntil(trackAction("survey-routine/success", "survey-routine", "api", { details }));
        } catch (err) {
            waitUntil(logError("survey-routine/invite-mail-failed", "survey-routine", "api", { details }, err));
        }
    }
};

export const GET = async (req: NextRequest) => {
    const cronSecret = env.CRON_SECRET;
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== cronSecret) {
        return NextResponse.json({ status: 401, statusMessage: "Unauthorized" });
    }

    if (!env.RESEND_API_MAIL || !env.RESEND_API_KEY) {
        return NextResponse.json({ status: 200, statusMessage: "Mail not configured" });
    }

    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    checkDate.setDate(checkDate.getDate() - 7);
    try {
        await sendMails(checkDate, "second_survey", "1", 2);
    } catch (err) {
        // errors are handled in sendMails
    }

    checkDate.setDate(checkDate.getDate() - 7);
    try {
        await sendMails(checkDate, "third_survey", "2", 3);
    } catch (err) {
        // errors are handled in sendMails
    }

    return new NextResponse("", { status: 200 });
};
