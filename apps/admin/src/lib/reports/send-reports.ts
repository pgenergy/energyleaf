import {getUsersWitDueReport, updateLastReportTimestamp} from "@energyleaf/db/query";
import {sendReport} from "@energyleaf/mail";
import {env} from "@/env.mjs";
import {ReportProps} from "@energyleaf/mail/src/types/reportProps";


interface UserReportData {
    userId: string;
    userName: string;
    email: string;
    receiveMails: boolean;

}

export interface CreateReportsResult {
    totalReports: number;
    savedReports: number;
    updatedLastReportTimestamps: number;
    successfulReports: number;
}

export async function createReportsAndSendMails() : Promise<CreateReportsResult> {
    const userReportData: Array<UserReportData> = await getUsersWitDueReport();

const totalReports = userReportData.length;
    let savedReports, updatedLastReportTimestamps, successfulReports = totalReports

    //todo implement counters and return them

    for (const userReport of userReportData) {
        if (userReport.userId === null) {
            console.error(`No user ID for User ${userReport.userName} to create and send report for`);
            successfulReports--;
            continue;
        }

        let reportProps: ReportProps;
        try {
            reportProps = createReportData(userReport)
        } catch (e) {
            console.error(`Error creating report for User ${userReport.userName} (User-ID ${userReport.userId}): ${e}`);
            successfulReports--;
            continue;
        }

        if (userReport.receiveMails) {
            try {
                await sendReportMail(userReport, reportProps);
            } catch (e) {
                console.error(`Error sending report for User ${userReport.userName} (User-ID ${userReport.userId}) to ${userReport.email}: ${e}`);
                continue;
            }
        }

        try {
            // await saveReport(props);
        } catch (e) {
            console.error(`Error saving report for User ${userReport.userName} (User-ID ${userReport.userId}): ${e}`);
        }

        try {
            await updateLastReportTimestamp(userReport.userId);
        } catch (e) {
            console.error(`Error updating last report timestamp for User ${userReport.userName} (User-ID ${userReport.userId}): ${e}`);
        }

        successfulReports++;
    }
    return {totalReports, successfulReports};
}

export async function createReportData(user: UserReportData): Promise<ReportProps> {

    return {
        //todo
    };
}

export async function sendReportMail(userReport: UserReportData, reportProps: ReportProps) {
    if (userReport.email === null) {
        throw new Error(`No email address for User ${userReport.userName} (User-ID ${userReport.userId}) to send report to`);
    }
    await sendReport({
        from: env.RESEND_API_MAIL,
        to: userReport.email,
        unsubscribeLink: "todo",
        apiKey: env.RESEND_API_KEY,
        reportProps: reportProps,
    });
}
