import { db } from "../";
import { logsTable } from "../schema/logs";

export async function log(
    title: string,
    logType: (typeof logsTable.logType.enumValues)[number],
    appFunction: string,
    appComponent: (typeof logsTable.appComponent.enumValues)[number],
    details: object,
) {
    await db.insert(logsTable).values({
        title: title,
        logType: logType,
        appFunction: appFunction,
        appComponent: appComponent,
        details: details,
    });
}

export async function logError(
    title: string,
    appFunction: string,
    appComponent: (typeof logsTable.appComponent.enumValues)[number],
    details: object,
    error: Error,
) {
    const detailsObj = {
        ...details,
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack?.split("\n").slice(1, 5).join("\n"),
        },
    };
    console.error(error);
    await log(title, "error", appFunction, appComponent, detailsObj);
}

export async function trackAction(
    title: string,
    appFunction: string,
    appComponent: (typeof logsTable.appComponent.enumValues)[number],
    details: object,
) {
    console.info(title, appFunction, appComponent, details);
    await log(title, "action", appFunction, appComponent, details);
}
