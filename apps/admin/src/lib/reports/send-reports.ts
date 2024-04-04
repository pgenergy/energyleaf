import {
    getAvgEnergyConsumptionForSensor,
    getEnergySumForSensorInRange, getUserDataByUserId,
    getUsersWitDueReport,
    updateLastReportTimestamp
} from "@energyleaf/db/query";
import {DayStatistics, ReportProps, sendReport} from "@energyleaf/mail";
import {env} from "@/env.mjs";
import {getElectricitySensorByUser} from "@/actions/sensors";
import {UserDataSelectType} from "@energyleaf/db/types";


interface UserReportData {
    userId: string;
    userName: string;
    email: string;
    receiveMails: boolean;
    interval: number;

}

export interface CreateReportsResult {
    totalReports: number;
    savedReports: number;
    updatedLastReportTimestamps: number;
    successfulReports: number;
}

export async function createReportsAndSendMails(): Promise<CreateReportsResult> {
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
            reportProps = await createReportData(userReport)
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
        }
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
