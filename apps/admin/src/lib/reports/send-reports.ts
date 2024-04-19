import { getUsersWitDueReport, updateLastReportTimestamp } from "@energyleaf/db/query";

export async function createReportsAndSendMails() {
    const userReportData = await getUsersWitDueReport();

    await Promise.all(
        userReportData.map(async (userReport) => {
            //todo: create report and send mail
            await updateLastReportTimestamp(userReport.userId);
        }),
    );
}
