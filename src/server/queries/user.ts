import { cache } from "react";
import "server-only";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "../db";
import { UserData, userDataTable, userTable } from "../db/tables/user";
import { getDemoUser } from "../lib/demo";

export const getUser = cache(async (userId: string) => {
	if (userId === "demo") {
		return getDemoUser();
	}
	const users = await db.select().from(userTable).where(eq(userTable.id, userId));
	if (users.length === 0) {
		return null;
	}

	return users[0];
});

export const getUserData = cache(async (userId: string) => {
	if (userId === "demo") {
		const cookieStore = await cookies();
		const data = cookieStore.get("user_data") ?? null;
		if (!data) {
			return null;
		}
		return JSON.parse(data.value) as UserData;
	}
	const datas = await db.select().from(userDataTable).where(eq(userDataTable.userId, userId));
	if (datas.length === 0) {
		return null;
	}

	return datas[0];
});
