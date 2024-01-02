import { NextResponse, type NextRequest } from "next/server";

export const POST = (_req: NextRequest) => {
    return NextResponse.json({
        status: "ok",
    });
};
