import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env.mjs";
import { createReportsAndSendMails } from "@/lib/reports/send-reports";

export const GET = async (req: NextRequest) => {
    const reportApiKey = env.CRON_SECRET;
    if (!req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${reportApiKey}`) {
        return NextResponse.json({ status: 403, statusMessage: "Forbidden" });
    }

    try {
        await createReportsAndSendMails();
        return NextResponse.json({ status: 200, statusMessage: "Reports created and sent" });
    } catch (e) {
        return NextResponse.json({ status: 500, statusMessage: "Internal Server Error" });
    }
};
