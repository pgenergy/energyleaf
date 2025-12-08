import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { genID } from "@/lib/utils";
import { env } from "./env";
import { SESSION_COOKIE_NAME } from "./lib/constants";

export async function proxy(req: NextRequest): Promise<NextResponse> {
	if (req.method === "GET") {
		const response = NextResponse.next();

		// tracking
		if (!req.cookies.get("s_id")?.value) {
			response.cookies.set("s_id", genID(20), {
				path: "/",
				sameSite: "lax",
				httpOnly: true,
				secure: env.VERCEL === "production",
			});
		}

		// auth session
		const token = req.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
		if (token !== null) {
			// Only extend cookie expiration on GET requests since we can be sure
			// a new session wasn't set when handling the request.
			response.cookies.set(SESSION_COOKIE_NAME, token, {
				path: "/",
				maxAge: 60 * 60 * 24 * 30,
				sameSite: "lax",
				httpOnly: true,
				secure: env.VERCEL_ENV === "production",
			});
		}
		return response;
	}

	const originHeader = req.headers.get("Origin");
	const hostHeader = req.headers.get("X-Forwarded-Host");
	if (originHeader === null || hostHeader === null) {
		return new NextResponse(null, {
			status: 403,
		});
	}
	let origin: URL;
	try {
		origin = new URL(originHeader);
	} catch {
		return new NextResponse(null, {
			status: 403,
		});
	}
	if (origin.host !== hostHeader) {
		return new NextResponse(null, {
			status: 403,
		});
	}
	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
