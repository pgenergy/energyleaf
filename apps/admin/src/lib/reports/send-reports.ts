import { env, getUrl } from "@/env.mjs";
import {
    createToken,
    getElectricitySensorIdForUser,
    getEnergySumForSensorInRange,
    getLastReportForUser,
    getUserDataByUserId,
    getUsersWitDueReport,
    logError,
    saveReport,
    trackAction,
    updateLastReportTimestamp,
} from "@energyleaf/db/query";
import { TokenType, type UserDataSelectType } from "@energyleaf/db/types";
import { buildUnsubscribeReportsUrl } from "@energyleaf/lib";
import type { DailyConsumption, DailyGoalProgress, DailyGoalStatistic, ReportProps } from "@energyleaf/lib";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { sendReport } from "@energyleaf/mail";
import { waitUntil } from "@vercel/functions";
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
    const usersWithDueReport: UserReportData[] = await getUsersWitDueReport();
    waitUntil(trackAction("users/start-due-reports-check", "report", "api", usersWithDueReport));

    const totalReports = usersWithDueReport.length;
    let successfulReports = 0;

    for (const userWithDueReport of usersWithDueReport) {
        let thisReportIsSuccessful = 1;

        let reportProps: ReportProps | null = null;
        let unsubscribeLink = "";
        try {
            reportProps = await createReportData(userWithDueReport);
            const unsubscribeToken = await createToken(userWithDueReport.userId, TokenType.Report);
            unsubscribeLink = buildUnsubscribeReportsUrl({ baseUrl: getUrl(env), token: unsubscribeToken });
        } catch (e) {
            waitUntil(
                logError(
                    "create-report/failed",
                    "report",
                    "api",
                    { userWithDueReport, reportProps, unsubscribeLink },
                    e,
                ),
            );
            thisReportIsSuccessful = 0;
            continue;
        }

        if (userWithDueReport.receiveMails) {
            try {
                await sendReportMail(userWithDueReport, reportProps, unsubscribeLink);
            } catch (e) {
                waitUntil(
                    logError(
                        "send-report/failed",
                        "report",
                        "api",
                        { userWithDueReport, reportProps, unsubscribeLink },
                        e,
                    ),
                );
                thisReportIsSuccessful = 0;
                continue;
            }
        }

        try {
            await saveReport(reportProps, userWithDueReport.userId);
        } catch (e) {
            waitUntil(
                logError(
                    "save-report-in-db/failed",
                    "report",
                    "api",
                    { userWithDueReport, reportProps, unsubscribeLink },
                    e,
                ),
            );
            thisReportIsSuccessful = 0;
        }

        try {
            await updateLastReportTimestamp(userWithDueReport.userId);
        } catch (e) {
            waitUntil(
                logError(
                    "update-last-report-timestamp/failed",
                    "report-creation",
                    "api",
                    { userWithDueReport, reportProps, unsubscribeLink },
                    e,
                ),
            );
            thisReportIsSuccessful = 0;
        }

        successfulReports += thisReportIsSuccessful;
    }

    waitUntil(trackAction("users/end-due-reports-check", "report", "api", { totalReports, successfulReports }));
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
    if (env.RESEND_API_KEY && env.RESEND_API_MAIL) {
        await sendReport({
            ...reportProps,
            from: env.RESEND_API_MAIL,
            to: userReport.email,
            unsubscribeLink: unsubscribeLink,
            apiKey: env.RESEND_API_KEY,
        });
    }
}
