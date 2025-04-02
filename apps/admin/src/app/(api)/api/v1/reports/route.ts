// import { env, getUrl } from "@/env.mjs";
// import type { Versions } from "@energyleaf/lib/versioning";
// import { log, logError, trackAction } from "@energyleaf/postgres/query/logs";
// import { getUsersWitDueReport } from "@energyleaf/postgres/query/report";
// import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

// interface UserReportData {
//     userId: string;
//     userName: string;
//     appVersion: Versions;
//     email: string;
//     receiveMails: boolean;
//     interval: number;
// }

export const GET = async (req: NextRequest) => {
    return NextResponse.json({ status: 200, statusMessage: "Ok" });
    // const cronSecret = env.CRON_SECRET;
    // if (!req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    //     waitUntil(log("request-unauthorized/missing-key", "error", "reports-creation", "api", req));
    //     return NextResponse.json({ status: 401, statusMessage: "Unauthorized" });
    // }
    //
    // try {
    //     const usersWithDueReport: UserReportData[] = await getUsersWitDueReport();
    //     waitUntil(trackAction("users/start-due-reports-check", "reports", "api", usersWithDueReport));
    //     const processEndpoint = `https://${getUrl(env)}/api/v1/process_reports`;
    //     const promises: Promise<void>[] = [];
    //     for (const userWithDueReport of usersWithDueReport) {
    //         const fn = async () => {
    //             try {
    //                 await fetch(processEndpoint, {
    //                     method: "POST",
    //                     headers: {
    //                         "Content-Type": "application/json",
    //                     },
    //                     body: JSON.stringify({
    //                         secret: cronSecret,
    //                         user: userWithDueReport,
    //                     }),
    //                 });
    //             } catch (err) {
    //                 waitUntil(
    //                     logError("reports-creation/failed", "reports-creation", "api", { userWithDueReport }, err),
    //                 );
    //             }
    //         };
    //
    //         promises.push(fn());
    //     }
    //     await Promise.allSettled(promises);
    //     return NextResponse.json({ status: 200, statusMessage: "Reports created and sent" });
    // } catch (e) {
    //     waitUntil(logError("unhandled-crash/failed-in-process-not-finished", "reports-creation", "api", req, e));
    //     return NextResponse.json({ status: 500, statusMessage: "Internal Server Error" });
    // }
};
