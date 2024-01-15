import {getAvgEnergyConsumptionForUserInComparison, getEnergyDataForUser, getPeaksForUser} from "@/query/energy";
import {getAllUsernamesAndMailsOfUsersWithWeeklyMail} from "@/query/user";

export async function sendMailToEveryUserWithWeeklyMail() {
    const usernameAndMails = await getAllUsernamesAndMailsOfUsersWithWeeklyMail();

    for (const user of usernameAndMails) {

        const data = await getEnergyDataForUser(new Date(), new Date(), user.id);
        const energy = await getAvgEnergyConsumptionForUserInComparison(user.id);
        const peaks = await getPeaksForUser(new Date(), new Date(), user.id);

        const mail = await generateWeeklyMail(data, energy, peaks);

        await sendMail(mail, user.email);
    }
}
