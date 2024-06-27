import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    return NextResponse.json(
        {
            status: 200,
            statusMessage: "Inserted log.",
        },
        { headers: { "x-vercel-verify": "526ff1ab0644ec896309f768842924441d43aacd" } },
    );
};
