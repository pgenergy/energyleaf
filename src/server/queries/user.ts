import { cache } from "react";
import "server-only";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "../db";
import { type UserData, userDataTable, userTable } from "../db/tables/user";
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

export async function getAllUsers() {
	const users = await db
		.select({
			id: userTable.id,
			username: userTable.username,
			email: userTable.email,
			firstname: userTable.firstname,
			lastname: userTable.lastname,
			isActive: userTable.isActive,
		})
		.from(userTable)
		.where(and(eq(userTable.deleted, false), eq(userTable.isActive, true)));

	return users;
}

export type UserForSelect = Awaited<ReturnType<typeof getAllUsers>>[number];

export async function getUserById(userId: string) {
	const users = await db
		.select({
			id: userTable.id,
			username: userTable.username,
			email: userTable.email,
		})
		.from(userTable)
		.where(eq(userTable.id, userId))
		.limit(1);

	if (users.length === 0) {
		return null;
	}

	return users[0];
}
