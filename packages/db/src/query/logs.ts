import db from "../index";
import { logs } from "../schema/logs";

export async function log(
    title: string,
    logType: (typeof logs.logType.enumValues)[number],
    appComponent: (typeof logs.appComponent.enumValues)[number],
    details: string,
) {
    await db.insert(logs).values({
        title: title,
        logType: logType,
        appComponent: appComponent,
        details: details,
    });
}
