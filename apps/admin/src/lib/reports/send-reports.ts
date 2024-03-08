import {getUsersWitDueReport} from "@energyleaf/db/query";

export async function createReportsAndSendMails() {
    const userReportData = await getUsersWitDueReport();

    for (const unserReport of userReportData) {
            // todo sent mail
    }
}
