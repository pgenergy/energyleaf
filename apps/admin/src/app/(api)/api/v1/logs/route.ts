import {NextRequest, NextResponse} from "next/server";
import {env} from "@/env.mjs";
import {createReportsAndSendMails} from "@/lib/reports/send-reports";
import * as Console from "node:console";

export const POST = async (req: NextRequest) => {
    const reportApiKey = env.REPORTS_API_KEY;
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== reportApiKey) {
        return NextResponse.json({status: 403, statusMessage: "Forbidden"});
    }

    Console.log(req)
    Console.log(req.headers)
    Console.log(req.body)

    // if (!data) {
    //     return NextResponse.json({status: 400, statusMessage: "Bad Request"});
    // }

    try {
         // await insertLog(data);
        await createReportsAndSendMails();
        return NextResponse.json({status: 200, statusMessage: "Inserted log."});
    } catch (e) {
        return NextResponse.json({status: 500, statusMessage: "Internal Server Error"});
    }
};