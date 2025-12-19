import { cache } from "react";
import "server-only";
import { and, count, desc, eq, like, or } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "../db";
import { deviceTable } from "../db/tables/device";
import { sensorTable } from "../db/tables/sensor";
import { type UserData, userDataTable, userExperimentDataTable, userTable } from "../db/tables/user";
import { lower } from "../db/types";
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

interface GetUsersPageParams {
	page?: number;
	pageSize?: number;
	query?: string;
}

export async function getUsersPage({ page = 1, pageSize = 20, query }: GetUsersPageParams = {}) {
	const safePage = page > 0 ? page : 1;
	const limit = pageSize > 0 ? pageSize : 20;
	const offset = (safePage - 1) * limit;

	const q = query?.trim().toLowerCase();
	const pattern = q ? `%${q}%` : null;

	const baseWhere = eq(userTable.deleted, false);

	const whereClause = pattern
		? and(
				baseWhere,
				or(
					like(lower(userTable.username), pattern),
					like(lower(userTable.email), pattern),
					like(lower(userTable.firstname), pattern),
					like(lower(userTable.lastname), pattern),
				),
			)
		: baseWhere;

	const users = await db
		.select({
			id: userTable.id,
			username: userTable.username,
			email: userTable.email,
			firstname: userTable.firstname,
			lastname: userTable.lastname,
			isActive: userTable.isActive,
			isParticipant: userTable.isParticipant,
			isAdmin: userTable.isAdmin,
			created: userTable.created,
		})
		.from(userTable)
		.where(whereClause)
		.orderBy(desc(userTable.created))
		.limit(limit)
		.offset(offset);

	const [{ total }] = await db.select({ total: count() }).from(userTable).where(whereClause);

	return {
		users,
		total,
		page: safePage,
		pageSize: limit,
	};
}

export type UserForPage = Awaited<ReturnType<typeof getUsersPage>>["users"][number];

// Full user data for admin detail page
export const getUserFullById = cache(async (userId: string) => {
	const users = await db
		.select({
			id: userTable.id,
			username: userTable.username,
			email: userTable.email,
			firstname: userTable.firstname,
			lastname: userTable.lastname,
			phone: userTable.phone,
			address: userTable.address,
			isActive: userTable.isActive,
			isAdmin: userTable.isAdmin,
			isParticipant: userTable.isParticipant,
			isSimulationFree: userTable.isSimulationFree,
			onboardingCompleted: userTable.onboardingCompleted,
			created: userTable.created,
			activationDate: userTable.activationDate,
			timezone: userTable.timezone,
		})
		.from(userTable)
		.where(eq(userTable.id, userId))
		.limit(1);

	if (users.length === 0) {
		return null;
	}

	return users[0];
});

export type UserFull = NonNullable<Awaited<ReturnType<typeof getUserFullById>>>;

// User household/energy data for admin detail page
export const getUserDataByUserId = cache(async (userId: string) => {
	const data = await db.select().from(userDataTable).where(eq(userDataTable.userId, userId)).limit(1);

	if (data.length === 0) {
		return null;
	}

	return data[0];
});

// User experiment data
export const getUserExperimentDataByUserId = cache(async (userId: string) => {
	const data = await db
		.select()
		.from(userExperimentDataTable)
		.where(eq(userExperimentDataTable.userId, userId))
		.limit(1);

	if (data.length === 0) {
		return null;
	}

	return data[0];
});

// Sensor linked to user
export const getSensorForUser = cache(async (userId: string) => {
	const sensors = await db
		.select({
			id: sensorTable.id,
			clientId: sensorTable.clientId,
			sensorType: sensorTable.sensorType,
			version: sensorTable.version,
		})
		.from(sensorTable)
		.where(eq(sensorTable.userId, userId));

	return sensors;
});

// Devices for user
export const getDevicesForUser = cache(async (userId: string) => {
	const devices = await db
		.select({
			id: deviceTable.id,
			name: deviceTable.name,
			category: deviceTable.category,
			created: deviceTable.created,
		})
		.from(deviceTable)
		.where(eq(deviceTable.userId, userId))
		.orderBy(desc(deviceTable.created));

	return devices;
});
