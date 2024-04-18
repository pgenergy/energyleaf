import {NextRequest, NextResponse} from "next/server";
import {env} from "@/env.mjs";
import {insertLog} from "@energyleaf/db/query";

export const POST = async (req: NextRequest) => {
    const reportApiKey = env.REPORTS_API_KEY;
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== reportApiKey) {
        return NextResponse.json({status: 403, statusMessage: "Forbidden"});
    }

    let data = await req.body.json();
    if (!data) {
        return NextResponse.json({status: 400, statusMessage: "Bad Request"});
    }

    try {
        await insertLog(data);
        return NextResponse.json({status: 200, statusMessage: "Inserted log."});
    } catch (e) {
        return NextResponse.json({status: 500, statusMessage: "Internal Server Error"});
    }
};