import {type NextRequest, NextResponse} from "next/server";
import {env} from "@/env.mjs";
import {createReportsAndSendMails} from "@/lib/reports/send-reports";
import * as Console from "node:console";
import {insertLog} from "@energyleaf/db/query";

export const POST = async (req: NextRequest) => {
    const reportApiKey = env.REPORTS_API_KEY;
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== reportApiKey) {
        return NextResponse.json({status: 403, statusMessage: "Forbidden"});
    }

    Console.log(req)
    Console.log(req.headers)
    Console.log(req.body)

    const data = req.body;

    if (!data) {
        return NextResponse.json({status: 400, statusMessage: "Bad Request"});
    }

    try {
        await insertLog({logType: "admin", content: data.content});
        await createReportsAndSendMails();
        return NextResponse.json({
            status: 200,
            statusMessage: "Inserted log."
        }).headers.set("x-vercel-verify", "526ff1ab0644ec896309f768842924441d43aacd");
    } catch (e) {
        return NextResponse.json({status: 500, statusMessage: "Internal Server Error"});
    }
};