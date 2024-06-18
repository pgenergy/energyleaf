import { env } from "@/env.mjs";
import { getUsersWhoRecieveSurveyMail, updateExperimentDataForUser } from "@energyleaf/db/query";
import { sendSurveyInviteEmail } from "@energyleaf/mail";
import { type NextRequest, NextResponse } from "next/server";

const sendMails = async (
    date: Date,
    status: "second_survey" | "third_survey",
    surveyId: string,
    surveyNumber: number,
) => {
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
                surveyNumber,
                surveyLink,
            });
        } catch (err) {
            console.error("Failed to send first survey mail", err);
        }
    }
};

export const POST = async (req: NextRequest) => {
    const cronSecret = env.CRON_SECRET;
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== cronSecret) {
        return NextResponse.json({ status: 401, statusMessage: "Unauthorized" });
    }

    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    checkDate.setDate(checkDate.getDate() - 7);
    try {
        await sendMails(checkDate, "second_survey", "1", 2);
    } catch (err) {
        console.error("Failed to send first survey mail", err);
    }

    checkDate.setDate(checkDate.getDate() - 7);
    try {
        await sendMails(checkDate, "third_survey", "2", 3);
    } catch (err) {
        console.error("Failed to send second survey mail", err);
    }
};
