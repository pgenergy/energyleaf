import { env } from "@/env.mjs";
import { createReportsAndSendMails } from "@/lib/reports/send-reports";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const reportApiKey = env.REPORTS_API_KEY;
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== reportApiKey) {
        return NextResponse.json({ status: 403, statusMessage: "Forbidden" });
    }

    try {
        await createReportsAndSendMails();
        return NextResponse.json({ status: 200, statusMessage: "Reports created and sent" });
    } catch (e) {
        return NextResponse.json({ status: 500, statusMessage: "Internal Server Error" });
    }
};
