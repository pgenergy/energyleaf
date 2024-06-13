import { env } from "@/env.mjs";
import { getUsersWhoReciveSurveyMail, updateExperimentDataForUser } from "@energyleaf/db/query";
import { sendSurveyInviteEmail } from "@energyleaf/mail";
import { type NextRequest, NextResponse } from "next/server";

const sendMails = async (date: Date, status: "first_survey" | "second_survey", surveyId: string) => {
    const firstSurveyUsers = await getUsersWhoReciveSurveyMail(date);
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
            console.error("Failed to update experiment data", err);
        }

        let name = user.username;

        if (user.firstname && user.lastName && user.firstname !== "" && user.lastName !== "") {
            name = `${user.firstname} ${user.lastName}`;
        }
        const surveyToken = user.id.replace(/-_/g, "");
        const surveyLink = `https://umfragen.uni-oldenburg.de/index.php?r=survey/index&token=${surveyToken}&sid=${surveyId}&lang=de`;

        try {
            await sendSurveyInviteEmail({
                to: user.email,
                from: env.RESEND_API_MAIL,
                apiKey: env.RESEND_API_KEY,
                name,
                surveyNumber: 1,
                surveyLink,
            });
        } catch (err) {
            console.error("Failed to send first survey mail", err);
        }
    }
};

export const POST = async (req: NextRequest) => {
    const reportApiKey = env.CRON_SECRET;
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== reportApiKey) {
        return NextResponse.json({ status: 401, statusMessage: "Unauthorized" });
    }

    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    checkDate.setDate(checkDate.getDate() - 7);
    try {
        await sendMails(checkDate, "first_survey", "1");
    } catch (err) {
        console.error("Failed to send first survey mail", err);
    }

    checkDate.setDate(checkDate.getDate() - 7);
    try {
        await sendMails(checkDate, "second_survey", "2");
    } catch (err) {
        console.error("Failed to send second survey mail", err);
    }
};
