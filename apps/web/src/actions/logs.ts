
export async function sendLogs(title: string,
                               logType: ("action" | "error" | "info" | "undefined"),
                               appFunction: string,
                               appComponent: ("web" | "admin" | "api" | "undefined"),
                               details: object){
    try {
        const logs = {
            title: title,
            logType: logType,
            appFunction: appFunction,
            appComponent: appComponent,
            details: details,
        }
        await fetch("http://localhost:4000/logs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(logs),
            credentials: "include",
        });
    } catch (error) {
        console.error(error);
    }
}
