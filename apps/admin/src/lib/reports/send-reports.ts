import { env } from "@/env.mjs";
import { convertTZDate } from "@energyleaf/lib";
import type { DailyConsumption, DailyGoalProgress, DailyGoalStatistic, ReportProps } from "@energyleaf/lib";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { sendReport } from "@energyleaf/mail";
import { getEnergySumForSensorInRange } from "@energyleaf/postgres/query/energy-get";
import { getLastReportForUser } from "@energyleaf/postgres/query/report";
import { getElectricitySensorIdForUser } from "@energyleaf/postgres/query/sensor";
import { getUserDataByUserId } from "@energyleaf/postgres/query/user";
import type { UserDataSelectType } from "@energyleaf/postgres/types";
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

export async function createReportData(user: UserReportData): Promise<ReportProps> {
    const serverDateFrom = new Date();
    serverDateFrom.setDate(serverDateFrom.getDate() - user.interval);
    serverDateFrom.setHours(0, 0, 0, 0);
    const dateFrom = convertTZDate(serverDateFrom);
    const serverDateTo = new Date();
    serverDateTo.setDate(serverDateTo.getDate() - 1);
    serverDateTo.setHours(23, 59, 59, 999);
    const dateTo = convertTZDate(serverDateTo);
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
        return convertTZDate(date);
    });
    const tasks: Promise<DailyConsumption>[] = dates.map(async (date) => {
        const serverEndDate = new Date(date);
        serverEndDate.setHours(23, 59, 59, 999);
        const endDate = convertTZDate(serverEndDate);

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
            reportPageLink: `${env.NEXT_PUBLIC_APP_URL}/reports`,
            apiKey: env.RESEND_API_KEY,
        });
    }
}
