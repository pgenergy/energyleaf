import {NextRequest, NextResponse} from "next/server";
import {createReportsAndSendMails} from "@/lib/reports/send-reports";
import {env} from "@/env.mjs";

export const POST = async (req: NextRequest) => {

    const reportApiKey = env.REPORTS_API_KEY;
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== reportApiKey){
        return NextResponse.json(({status: 403, statusMessage: "Forbidden"}));
    }

    await createReportsAndSendMails();
    return NextResponse.json({status: 200, statusMessage: "Reports created and sent"});
}