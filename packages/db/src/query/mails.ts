import { eq } from "drizzle-orm";
import db from "..";
import { historyReportConfig, reportConfig, user } from "../schema";
import type { AnomalyConfig, MailConfig } from "../types/types";
import { getReportConfigByUserId } from "./reports";

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
                receiveMails: reportConf.receiveMails,
                interval: reportConf.interval,
                time: reportConf.time,
                createdTimestamp: new Date(),
            })
            .where(eq(reportConfig.userId, userId));

        await trx.update(user).set({ receiveAnomalyMails: anomalyConfig.receiveMails }).where(eq(user.id, userId));
    });
}

export async function getMailSettings(userId: string): Promise<MailConfig> {
    return await db.transaction(async (trx) => {
        const reportConfig = await getReportConfigByUserId(trx, userId);
        if (!reportConfig) {
            throw new Error("Report config not found");
        }

        const userEntry = await trx.select().from(user).where(eq(user.id, userId));
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
