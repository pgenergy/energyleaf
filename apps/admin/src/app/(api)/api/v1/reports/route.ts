import {NextRequest, NextResponse} from "next/server";
import {ScriptAcceptedResponse} from "@energyleaf/proto";
import {createReportsAndSendMails} from "@/lib/reports/send-reports";
import {env} from "@/env.mjs";

export const POST = async (req: NextRequest) => {

    const reportApiKey = env.get("REPORT_API_KEY");
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== reportApiKey){
        return new NextResponse(ScriptAcceptedResponse.toBinary({status: 403, statusMessage: "Unauthorized"}), {
            status: 403,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    await createReportsAndSendMails();
}