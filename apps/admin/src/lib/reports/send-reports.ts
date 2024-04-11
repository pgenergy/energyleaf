import {
    createToken,
    getEnergySumForSensorInRange, getLastReportForUser, getUserDataByUserId,
    getUsersWitDueReport, saveReport,
    updateLastReportTimestamp
} from "@energyleaf/db/query";
import {sendReport} from "@energyleaf/mail";
import {env} from "@/env.mjs";
import {getElectricitySensorByUser} from "@/actions/sensors";
import {TokenType, UserDataSelectType} from "@energyleaf/db/types";
import {buildUnsubscribeReportsUrl} from "@energyleaf/lib";
import {DayStatistics, ReportProps} from "@energyleaf/mail/types";


interface UserReportData {
    userId: string;
    userName: string;
    email: string;
    receiveMails: boolean;
    interval: number;
}

export async function createReportsAndSendMails() {
    const userReportData: Array<UserReportData> = await getUsersWitDueReport();

    const totalReports = userReportData.length;
    let successfulReports = 0;
    let sentReports = 0;
    let savedReports = 0;
    let updatedLastReportTimestamps = 0;

    for (const userReport of userReportData) {
        let reportProps: ReportProps;
        let unsubscribeLink = "";
        try {
            reportProps = await createReportData(userReport);
            const unsubscribeToken = await createToken(userReport.userId, TokenType.Report);
            unsubscribeLink = buildUnsubscribeReportsUrl({env, token: unsubscribeToken});
        } catch (e) {
            console.error(`Error creating report for User ${userReport.userName} (User-ID ${userReport.userId}): ${e}`);
            continue;
        }

        if (userReport.receiveMails) {
            try {
                await sendReportMail(userReport, reportProps, unsubscribeLink);
                sentReports++;
            } catch (e) {
                console.error(`Error sending report for User ${userReport.userName} (User-ID ${userReport.userId}) to ${userReport.email}: ${e}`);
                continue;
            }
        }

        try {
            await saveReport(reportProps, userReport.userId);
            savedReports++;
        } catch (e) {
            console.error(`Error saving report for User ${userReport.userName} (User-ID ${userReport.userId}): ${e}`);
        }

        try {
            await updateLastReportTimestamp(userReport.userId);
            updatedLastReportTimestamps++;
        } catch (e) {
            console.error(`Error updating last report timestamp for User ${userReport.userName} (User-ID ${userReport.userId}): ${e}`);
        }

        successfulReports++;
    }

    // TODO: maybe improve logging
    console.info(`--Send Report Results-- `,
        ` Total reports: ${totalReports} `,
        ` Successful reports: ${successfulReports}`,
        ` Sent reports: ${sentReports} `,
        ` Saved reports: ${savedReports} `,
        ` Updated last report timestamp: ${updatedLastReportTimestamps}`);
}

export async function createReportData(user: UserReportData): Promise<ReportProps> {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - user.interval);
    dateFrom.setHours(0, 0, 0, 0);
    const dateTo = new Date();
    dateTo.setDate(dateTo.getDate() - 1);
    dateTo.setHours(23, 59, 59, 999);
    const sensor = await getElectricitySensorByUser(user.userId);
    if (!sensor) {
        throw new Error(`No electricity sensor found for User`);
    }

    const userData = await getUserDataByUserId(user.userId);
    if (!userData) {
        throw new Error(`No user data found for User`);
    }

    const totalEnergyConsumption = await getEnergySumForSensorInRange(dateFrom, dateTo, sensor);

    const avgEnergyConsumption = totalEnergyConsumption / user.interval;
    const workingPrice = userData.workingPrice ?? 0;
    const totalEnergyCost = totalEnergyConsumption * workingPrice;
    const avgEnergyCost = avgEnergyConsumption * workingPrice;

    const dayStatistics: DayStatistics[] = await getDayStatistics(userData, sensor, dateFrom, user.interval);

    const lastReport = await getLastReportForUser(user.userId);

    return {
        name: user.userName,
        dateFrom: dateFrom,
        dateTo: dateTo,
        dayEnergyStatistics: dayStatistics,
        totalEnergyConsumption: totalEnergyConsumption,
        avgEnergyConsumptionPerDay: avgEnergyConsumption,
        totalEnergyCost: totalEnergyCost,
        avgEnergyCost: avgEnergyCost,
        highestPeak: {
            dateTime: dateTo,
            deviceName: "my device",
            consumption: "1000 kWh"
        },
        lastReport: lastReport ?? undefined
    };
}


async function getDayStatistics(userData: UserDataSelectType, sensor: string, dateFrom: Date, interval: number): Promise<DayStatistics[]> {
    const dates = new Array(interval).fill(null).map((_, index) => {
        const date = new Date(dateFrom);
        date.setDate(date.getDate() + index);
        date.setHours(0, 0, 0, 0);
        return date;
    });
    const tasks: Promise<DayStatistics>[] = dates.map(async (date) => {
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const sumOfDay = await getEnergySumForSensorInRange(date, endDate, sensor);

        return {
            day: date,
            dailyConsumption: sumOfDay,
            dailyGoal: userData.consumptionGoal ?? undefined,
            exceeded: userData.consumptionGoal ? sumOfDay > userData.consumptionGoal : undefined,
            progress: userData.consumptionGoal ? sumOfDay / userData.consumptionGoal : undefined
        };
    });
    return await Promise.all(tasks);
}

export async function sendReportMail(userReport: UserReportData, reportProps: ReportProps, unsubscribeLink: string) {
    if (userReport.email === null) {
        throw new Error(`No email address for User ${userReport.userName} (User-ID ${userReport.userId}) to send report to`);
    }
    await sendReport({
        from: env.RESEND_API_MAIL,
        to: userReport.email,
        unsubscribeLink: unsubscribeLink,
        apiKey: env.RESEND_API_KEY,
        reportProps: reportProps,
    });
}
