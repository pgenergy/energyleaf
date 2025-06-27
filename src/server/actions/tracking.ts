"use server";

import { env } from "@/env";
import { genID } from "@/lib/utils";
import { cookies } from "next/headers";
import { db } from "../db";
import { pageViewTable } from "../db/tables/logs";
import { getCurrentSession } from "../lib/auth";

export async function trackPageViewAction(pathname: string, searchParams: string, params: string, userAgent: string) {
	try {
		const { user } = await getCurrentSession();
		if (!user) {
			return;
		}

		if (user.id === "demo") {
			return;
		}

		const cookieStore = await cookies();
		let sessionId = cookieStore.get("s_id")?.value;
		if (!sessionId) {
			sessionId = genID(30);
			cookieStore.set("s_id", sessionId, {
				path: "/",
				sameSite: "lax",
				httpOnly: true,
				secure: env.VERCEL === "production",
			});
		}

		await db.insert(pageViewTable).values({
			userId: user.id,
			path: pathname,
			searchParams: JSON.parse(searchParams),
			params: JSON.parse(params),
			userAgent: userAgent,
			session_id: sessionId,
		});
	} catch (err) {
		console.error(err);
	}
}
