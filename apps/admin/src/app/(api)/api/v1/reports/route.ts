import { env } from "@/env.mjs";
import { createReportsAndSendMails } from "@/lib/reports/send-reports";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const reportApiKey = env.CRON_SECRET;
    if (!req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${reportApiKey}`) {
        return NextResponse.json({ status: 401, statusMessage: "Unauthorized" });
    }

    try {
        await createReportsAndSendMails();
        return NextResponse.json({ status: 200, statusMessage: "Reports created and sent" });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ status: 500, statusMessage: "Internal Server Error" });
    }
};
