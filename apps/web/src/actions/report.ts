import {getUsersWitDueReport} from "@/query/user";

export async function sendMailToEveryUserWithWeeklyMail() {
    const userReportData = await getUsersWitDueReport();

    for (const unserReport of userReportData) {
            // todo sent mail
    }
}
