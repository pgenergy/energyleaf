// import { env, getUrl } from "@/env.mjs";
// import { log, logError, trackAction } from "@energyleaf/postgres/query/logs";
// import { getUsersWhoRecieveAnomalyMail } from "@energyleaf/postgres/query/user";
// import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export const GET = async (req: NextRequest) => {
    return NextResponse.json({ statusMessage: "Ok" }, { status: 200 });
    // const cronSecret = env.CRON_SECRET;
    // if (!req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    //     waitUntil(log("request-unauthorized/missing-key", "error", "anomaly-check", "api", req));
    //     return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
    // }
    //
    // try {
    //     const now = new Date();
    //     waitUntil(trackAction("all-users/start-anomalies-check", "anomaly-check", "api", { timestamp: now }));
    //     const userData = await getUsersWhoRecieveAnomalyMail();
    //     const promises: Promise<void>[] = [];
    //     const processEndpoint = `https://${getUrl(env)}/api/v1/process_anomaly`;
    //     for (const data of userData) {
    //         const { user, sensor } = data;
    //         const fn = async () => {
    //             try {
    //                 await fetch(processEndpoint, {
    //                     method: "POST",
    //                     headers: {
    //                         "Content-Type": "application/json",
    //                     },
    //                     body: JSON.stringify({
    //                         secret: cronSecret,
    //                         sensorId: sensor.id,
    //                         user: {
    //                             id: user.id,
    //                             username: user.username,
    //                             email: user.email,
    //                         },
    //                     }),
    //                 });
    //             } catch (err) {
    //                 waitUntil(
    //                     logError(
    //                         "anomaly-check/failed",
    //                         "anomaly-check",
    //                         "api",
    //                         { userId: user.id, sensorId: sensor.id },
    //                         err,
    //                     ),
    //                 );
    //             }
    //         };
    //         promises.push(fn());
    //     }
    //     await Promise.allSettled(promises);
    //     return NextResponse.json({ statusMessage: "Anomaly mails created and sent" });
    // } catch (e) {
    //     waitUntil(logError("unhandled-crash/failed-in-process-not-finished", "anomaly-check", "api", req, e));
    //     return NextResponse.json({ statusMessage: "Internal Server Error" }, { status: 500 });
    // }
};
