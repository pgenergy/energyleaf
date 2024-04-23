import { and, desc, eq, gt, lte, or, sql } from "drizzle-orm";

import { DayStatistics, ReportProps } from "@energyleaf/mail/types";

import db from "../";
import { historyReportConfig, reportConfig, reports, reportsDayStatistics } from "../schema/reports";
import { user } from "../schema/user";

/**
 * Update the user report settings data in the database
 */
export async function updateReportConfig(
    data: {
        receiveMails: boolean;
        interval: number;
        time: number;
    },
    id: string,
) {
    return db.transaction(async (trx) => {
        const oldReportData = await getReportConfigByUserId(id);
        if (!oldReportData) {
            throw new Error("Old user data not found");
        }
        await trx.insert(historyReportConfig).values({
            userId: oldReportData.userId,
            receiveMails: oldReportData.receiveMails,
            interval: oldReportData.interval,
            time: oldReportData.time,
            timestampLast: oldReportData.timestampLast,
            createdTimestamp: oldReportData.createdTimestamp,
        });

        await trx
            .update(reportConfig)
            .set({
                receiveMails: data.receiveMails,
                interval: data.interval,
                time: data.time,
                createdTimestamp: new Date(),
            })
            .where(eq(reportConfig.userId, id));
    });
}

export async function getReportConfigByUserId(id: string) {
    const data = await db.select().from(reportConfig).where(eq(reportConfig.userId, id));

    if (data.length === 0) {
        return null;
    }

    return data[0];
}

export async function updateLastReportTimestamp(userId: string) {
    return db.update(reportConfig).set({ timestampLast: new Date() }).where(eq(reportConfig.userId, userId));
}

/**
 * Get users with due report to create and send reports </br>
 * the report is due if the current date is greater than the last report date + interval or </br>
 * if the current date is equal to the last report date + interval and the current time is greater than the report time </br>
 *
 * @returns The users with due report
 */
export async function getUsersWithDueReport() {
    return db
        .select({
            userId: user.id,
            userName: user.username,
            email: user.email,
            receiveMails: reportConfig.receiveMails,
            interval: reportConfig.interval,
        })
        .from(reportConfig)
        .innerJoin(user, eq(user.id, reportConfig.userId))
        .where(
            or(
                gt(sql`DATEDIFF(NOW(), reports.timestamp_last)`, reportConfig.interval),
                and(
                    eq(sql`DATEDIFF(NOW(), reports.timestamp_last)`, reportConfig.interval),
                    lte(reportConfig.time, new Date().getHours()),
                ),
            ),
        );
}

export async function getLastReportForUser(userId: string): Promise<ReportProps | null> {
    const userReports = await getReportForUserDescending(userId);

    if (!userReports || userReports.length === 0) {
        console.log("No report found for user");
        return null;
    }

    const lastReport = userReports[0];

    return {
        dateFrom: lastReport.dateFrom.toLocaleDateString(),
        dateTo: lastReport.dateTo.toLocaleDateString(),
        totalEnergyConsumption: lastReport.totalEnergyConsumption,
        avgEnergyConsumptionPerDay: lastReport.avgEnergyConsumptionPerDay,
        totalEnergyCost: lastReport.totalEnergyCost,
        avgEnergyCost: lastReport.avgEnergyCost,
        highestPeak: {
            dateTime: new Date(lastReport.highestPeakDateTime ?? new Date(0)),
            deviceName: lastReport.highestPeakDeviceName ?? "",
            consumption: lastReport.highestPeakConsumption ?? "",
        },
        dayEnergyStatistics: [],
    };
}

export async function getReportForUserDescending(userId: string) {
    return db
        .select({
            id: reports.id,
            dateFrom: reports.dateFrom,
            dateTo: reports.dateTo,
            totalEnergyConsumption: reports.totalEnergyConsumption,
            avgEnergyConsumptionPerDay: reports.avgEnergyConsumptionPerDay,
            totalEnergyCost: reports.totalEnergyCost,
            avgEnergyCost: reports.avgEnergyCost,
            highestPeakDateTime: reports.highestPeakDateTime,
            highestPeakDeviceName: reports.highestPeakDeviceName,
            highestPeakConsumption: reports.highestPeakConsumption,
        })
        .from(reports)
        .where(eq(reports.userId, userId))
        .orderBy(desc(reports.timestamp));
}

export async function saveReport(reportProps: ReportProps, userId: string) {
    return db.transaction(async (trx) => {
        const dateFrom = new Date(reportProps.dateFrom);
        const dateTo = new Date(reportProps.dateTo);

        await trx.insert(reports).values({
            timestamp: new Date(),
            dateFrom: dateFrom,
            dateTo: dateTo,
            userId: userId,
            totalEnergyConsumption: reportProps.totalEnergyConsumption,
            avgEnergyConsumptionPerDay: reportProps.avgEnergyConsumptionPerDay,
            totalEnergyCost: reportProps.totalEnergyCost,
            avgEnergyCost: reportProps.avgEnergyCost,
            highestPeakDateTime: reportProps.highestPeak.dateTime,
            highestPeakDeviceName: reportProps.highestPeak.deviceName,
            highestPeakConsumption: reportProps.highestPeak.consumption,
        });
        const newReport = await trx
            .select({ id: reports.id })
            .from(reports)
            .where(and(eq(reports.userId, userId), eq(reports.dateFrom, dateFrom)));

        const reportID = newReport[0].id;

        const tasks = reportProps.dayEnergyStatistics.map(async (dayStat: DayStatistics) => {
            await trx.insert(reportsDayStatistics).values({
                date: new Date(dayStat.day),
                dailyConsumption: dayStat.dailyConsumption,
                progress: dayStat.progress,
                exceeded: dayStat.exceeded,
                dailyGoal: dayStat.dailyGoal,
                reportId: reportID,
            });
        });
        await Promise.all(tasks);
    });
}
