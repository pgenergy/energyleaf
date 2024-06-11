import { env, getUrl } from "@/env.mjs";
import {
    createToken,
    getElectricitySensorIdForUser,
    getEnergySumForSensorInRange,
    getLastReportForUser,
    getUserDataByUserId,
    getUsersWitDueReport,
    saveReport,
    updateLastReportTimestamp,
} from "@energyleaf/db/query";
import { TokenType, type UserDataSelectType } from "@energyleaf/db/types";
import { buildUnsubscribeReportsUrl } from "@energyleaf/lib";
import type { DailyConsumption, DailyGoalProgress, DailyGoalStatistic, ReportProps } from "@energyleaf/lib";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { sendReport } from "@energyleaf/mail";
import { renderChart } from "@energyleaf/ui/tools";
import { renderDailyConsumptionChart, renderDailyStatistic } from "./graphs";
import { renderImage } from "./image";

interface UserReportData {
    userId: string;
    userName: string;
    appVersion: Versions;
    email: string;
    receiveMails: boolean;
    interval: number;
}

export async function createReportsAndSendMails() {
    const userReportData: UserReportData[] = await getUsersWitDueReport();

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
            unsubscribeLink = buildUnsubscribeReportsUrl({ baseUrl: getUrl(env), token: unsubscribeToken });
        } catch (e) {
            console.error(`Error creating report for User ${userReport.userName} (User-ID ${userReport.userId}): ${e}`);
            continue;
        }

        if (userReport.receiveMails) {
            try {
                await sendReportMail(userReport, reportProps, unsubscribeLink);
                sentReports++;
            } catch (e) {
                console.error(
                    `Error sending report for User ${userReport.userName} (User-ID ${userReport.userId}) to ${userReport.email}: ${e}`,
                );
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
            console.error(
                `Error updating last report timestamp for User ${userReport.userName} (User-ID ${userReport.userId}): ${e}`,
            );
        }

        successfulReports++;
    }

    console.info(
        "--Send Report Results-- ",
        ` Total reports: ${totalReports} `,
        ` Successful reports: ${successfulReports}`,
        ` Sent reports: ${sentReports} `,
        ` Saved reports: ${savedReports} `,
        ` Updated last report timestamp: ${updatedLastReportTimestamps}`,
    );
}

export async function createReportData(user: UserReportData): Promise<ReportProps> {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - user.interval);
    dateFrom.setHours(0, 0, 0, 0);
    const dateTo = new Date();
    dateTo.setDate(dateTo.getDate() - 1);
    dateTo.setHours(23, 59, 59, 999);
    const sensor = await getElectricitySensorIdForUser(user.userId);
    if (!sensor) {
        throw new Error("No electricity sensor found for User");
    }

    const userData = await getUserDataByUserId(user.userId);
    if (!userData) {
        throw new Error("No user data found for User");
    }

    const totalEnergyConsumption = await getEnergySumForSensorInRange(dateFrom, dateTo, sensor);

    const avgEnergyConsumption = totalEnergyConsumption / user.interval;
    const workingPrice = userData.workingPrice;
    const totalEnergyCost = workingPrice ? totalEnergyConsumption * workingPrice : undefined;
    const avgEnergyCost = workingPrice ? avgEnergyConsumption * workingPrice : undefined;

    const dailyConsumption: DailyConsumption[] = await getDailyConsumption(sensor, dateFrom, user.interval);
    const bestDay = dailyConsumption.reduce((prev, current) =>
        prev.consumption < current.consumption ? prev : current,
    );
    const worstDay = dailyConsumption.reduce((prev, current) =>
        prev.consumption > current.consumption ? prev : current,
    );

    const dayStatistics: DailyGoalStatistic[] | undefined = fulfills(user.appVersion, Versions.self_reflection)
        ? await getDailyGoalStatistic(dailyConsumption, userData)
        : undefined;

    const dailyConsumptionGraph: string = await renderImage(() => renderDailyConsumptionChart(dailyConsumption));

    const lastReport = await getLastReportForUser(user.userId);

    return {
        userName: user.userName,
        dateFrom: dateFrom,
        dateTo: dateTo,
        dayEnergyStatistics: dayStatistics,
        totalEnergyConsumption: totalEnergyConsumption,
        avgEnergyConsumptionPerDay: avgEnergyConsumption,
        totalEnergyCost: totalEnergyCost,
        avgEnergyCost: avgEnergyCost,
        bestDay: bestDay,
        worstDay: worstDay,
        lastReport: lastReport ?? undefined,
        dailyTotalConsumptionGraph: dailyConsumptionGraph,
    };
}

async function getDailyConsumption(sensor: string, dateFrom: Date, interval: number): Promise<DailyConsumption[]> {
    const dates = new Array(interval).fill(null).map((_, index) => {
        const date = new Date(dateFrom);
        date.setDate(date.getDate() + index);
        date.setHours(0, 0, 0, 0);
        return date;
    });
    const tasks: Promise<DailyConsumption>[] = dates.map(async (date) => {
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const sumOfDay = await getEnergySumForSensorInRange(date, endDate, sensor);

        return {
            day: date,
            consumption: sumOfDay,
        };
    });
    return await Promise.all(tasks);
}

async function getDailyGoalStatistic(
    dailyConsumption: DailyConsumption[],
    userData: UserDataSelectType,
): Promise<DailyGoalStatistic[]> {
    const dailyGoalProgresses = await getDailyGoalProgress(dailyConsumption, userData);
    const promises = dailyGoalProgresses.map(async (day) => {
        return {
            ...day,
            image: await renderImage(() => renderDailyStatistic(day)),
        };
    });
    return await Promise.all(promises);
}

async function getDailyGoalProgress(
    dailyConsumption: DailyConsumption[],
    userData: UserDataSelectType,
): Promise<DailyGoalProgress[]> {
    return dailyConsumption.map((day) => {
        return {
            day: day.day,
            dailyConsumption: day.consumption,
            dailyGoal: userData.consumptionGoal ?? undefined,
            exceeded: userData.consumptionGoal ? day.consumption > userData.consumptionGoal : undefined,
            progress: userData.consumptionGoal ? (day.consumption / userData.consumptionGoal) * 100 : undefined,
        };
    });
}

export async function sendReportMail(userReport: UserReportData, reportProps: ReportProps, unsubscribeLink: string) {
    if (!userReport.email) {
        throw new Error(
            `No email address for User ${userReport.userName} (User-ID ${userReport.userId}) to send report to`,
        );
    }
    await sendReport({
        ...reportProps,
        from: env.RESEND_API_MAIL,
        to: userReport.email,
        unsubscribeLink: unsubscribeLink,
        apiKey: env.RESEND_API_KEY,
    });
}
