import db from "../index";
import {logs} from "../schema/logs";

export type LogType = {
    logType:  (typeof logs.logType.enumValues)[number];
    content: string;
};

export async function insertLog(data: LogType) {
    await db.insert(logs).values({
        logType: data.logType,
        content: data.content
    });
}