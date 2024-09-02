import { eq } from "drizzle-orm";
import { db } from "..";
import { historyReportConfigTable, reportConfigTable } from "../schema/reports";
import { userTable } from "../schema/user";
import type { AnomalyConfig, MailConfig } from "../types/types";
import { getReportConfigByUserId } from "./report";

interface MailConfigUpdateType {
    reportConfig: {
        receiveMails: boolean;
        interval: number;
        time: number;
    };
    anomalyConfig: AnomalyConfig;
}

export async function updateMailSettings(
    { reportConfig: reportConf, anomalyConfig }: MailConfigUpdateType,
    userId: string,
) {
    return db.transaction(async (trx) => {
        const oldReportData = await getReportConfigByUserId(trx, userId);
        if (!oldReportData) {
            throw new Error("Old user data not found");
        }
        await trx.insert(historyReportConfigTable).values({
            userId: oldReportData.userId,
            receiveMails: oldReportData.receiveMails,
            interval: oldReportData.interval,
            time: oldReportData.time,
            timestampLast: oldReportData.timestampLast,
            createdTimestamp: oldReportData.createdTimestamp,
        });

        await trx
            .update(reportConfigTable)
            .set({
                receiveMails: reportConf.receiveMails,
                interval: reportConf.interval,
                time: reportConf.time,
                createdTimestamp: new Date(),
            })
            .where(eq(reportConfigTable.userId, userId));

        await trx
            .update(userTable)
            .set({ receiveAnomalyMails: anomalyConfig.receiveMails })
            .where(eq(userTable.id, userId));
    });
}

export async function getMailSettings(userId: string): Promise<MailConfig> {
    return await db.transaction(async (trx) => {
        const reportConfig = await getReportConfigByUserId(trx, userId);
        if (!reportConfig) {
            throw new Error("Report config not found");
        }

        const userEntry = await trx.select().from(userTable).where(eq(userTable.id, userId));
        if (!reportConfig || !userEntry) {
            throw new Error("User not found");
        }

        return {
            report_config: reportConfig,
            anomaly_config: {
                receiveMails: userEntry[0].receiveAnomalyMails,
            },
        };
    });
}
