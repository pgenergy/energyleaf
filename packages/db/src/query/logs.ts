import db from "../index";
import { logs } from "../schema/logs";

export async function log(
    title: string,
    logType: (typeof logs.logType.enumValues)[number],
    appFunction: string,
    appComponent: (typeof logs.appComponent.enumValues)[number],
    details: object,
) {
    await db.insert(logs).values({
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
    appComponent: (typeof logs.appComponent.enumValues)[number],
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

    //Important todo -> Use blob function to store error stack
    // todo for next pge-180 -> Integrate postHog custom events?
    console.error(error);
    await log(title, "error", appFunction, appComponent, detailsObj);
}

export async function trackAction(
    title: string,
    appFunction: string,
    appComponent: (typeof logs.appComponent.enumValues)[number],
    details: object,
) {
    await log(title, "action", appFunction, appComponent, details);
}
