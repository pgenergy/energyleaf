import { and, desc, eq, gt, lte, or, sql } from "drizzle-orm";
import db from "../";
import {historyReports, historyUserData, reportConfig, reports, session, token, user, userData} from "../schema";
import type { UserSelectType } from "../types/types";
import { TokenType } from "../types/types";
import { getReportConfigByUserId } from "./reports";

/**
 * Get a user by id from the database
 *
 * @param id<number> The id of the user
 *
 * @returns The user or null if not found
 */
export async function getUserById(id: string) {
    const query = await db.select().from(user).where(eq(user.id, id));
    if (query.length === 0) {
        return null;
    }
    return query[0];
}

export async function deleteSessionsOfUser(id: string) {
    return await db.delete(session).where(eq(session.userId, id));
}

/**
 * Get a user by mail from the database
 *
 * @param email<string> The email of the user
 *
 * @returns The user or null if not found
 */
export async function getUserByMail(email: string) {
    const query = await db.select().from(user).where(eq(user.email, email));
    if (query.length === 0) {
        return null;
    }
    return query[0];
}

export type CreateUserType = {
    firstname: string;
    lastname: string;
    phone?: string;
    comment?: string;
    hasPower: boolean;
    address: string;
    hasWifi: boolean;
    email: string;
    password: string;
    username: string;
    electricityMeterType: (typeof userData.electricityMeterType.enumValues)[number];
    meterImgUrl?: string;
};

/**
 * Create a user in the database
 */
export async function createUser(data: CreateUserType) {
    return db.transaction(async (trx) => {
        const check = await trx.select().from(user).where(eq(user.email, data.email));

        if (check.length > 0) {
            throw new Error("User already exists");
        }

        await trx.insert(user).values({
            firstname: data.firstname,
            lastName: data.lastname,
            address: data.address,
            phone: data.phone,
            username: data.username,
            email: data.email,
            password: data.password,
        });

        const newUser = await trx
            .select({
                id: user.id,
            })
            .from(user)
            .where(eq(user.email, data.email));

        if (newUser.length === 0) {
            throw new Error("User not found");
        }

        const id = newUser[0].id;

        await trx.insert(userData).values({
            userId: id,
            electricityMeterType: data.electricityMeterType,
            electricityMeterImgUrl: data.meterImgUrl || null,
            powerAtElectricityMeter: data.hasPower,
            wifiAtElectricityMeter: data.hasWifi,
            installationComment: data.comment,
        });

        await trx.insert(reportConfig).values({
            userId: id,
            timestampLast: new Date(),
        });
    });
}

/**
 * Get the current user data from the database
 */
export async function getUserData(id: string) {
    const data = await db
        .select()
        .from(userData)
        .innerJoin(reportConfig, eq(userData.userId, reportConfig.userId))
        .where(eq(userData.userId, id));

    if (data.length === 0) {
        return null;
    }

    return data[0];
}

/**
 * Gets the history of user data from the database
 */
export async function getUserDataHistory(id: string) {
    return await db.transaction(async (trx) => {
        return trx
            .select()
            .from(historyUserData)
            .where(eq(historyUserData.userId, id))
            .union(trx.select().from(userData).where(eq(userData.userId, id)))
            .orderBy(historyUserData.timestamp);
    });
}

/**
 * Update the user data in the database
 */
export async function updateUser(data: Partial<UserSelectType>, id: string) {
    return db.update(user).set(data).where(eq(user.id, id));
}

/**
 * Update the user's password in the database
 */
export async function updatePassword(data: Partial<CreateUserType>, id: string) {
    return await db.update(user).set(data).where(eq(user.id, id));
}

/**
 * Update the user report settings data in the database
 */
export async function updateReportSettings(
    data: {
        receiveMails: boolean;
        interval: number;
        time: number;
    },
    id: string,
) {
    return db.transaction(async (trx) => {
        const oldReportData = await getReportConfigByUserId(trx, id);
        if (!oldReportData) {
            throw new Error("Old user data not found");
        }
        await trx.insert(historyReports).values({
            userId: oldReportData.userId,
            receiveMails: oldReportData.receiveMails,
            interval: oldReportData.interval,
            time: oldReportData.time,
            timestampLast: oldReportData.timestampLast,
            createdTimestamp: oldReportData.createdTimestamp,
        });

        await trx
            .update(reportConfig)
            .set({
                receiveMails: data.receiveMails,
                interval: data.interval,
                time: data.time,
                createdTimestamp: new Date(),
            })
            .where(eq(reports.userId, id));
    });
}

type UpdateUserData = {
    tariff: (typeof userData.tariff.enumValues)[number];
    property: (typeof userData.property.enumValues)[number];
    livingSpace: number;
    hotWater: (typeof userData.hotWater.enumValues)[number];
    household: number;
    basePrice: number;
    workingPrice: number;
    timestamp: Date;
    monthlyPayment: number;
    consumptionGoal: number;
};

export async function updateUserData(data: Partial<UpdateUserData>, id: string) {
    return db.transaction(async (trx) => {
        const oldUserData = await getUserDataByUserId(id);
        if (!oldUserData) {
            throw new Error("Old user data not found");
        }

        await trx.insert(historyUserData).values({ ...oldUserData, id: undefined });
        await trx.update(userData).set(data).where(eq(userData.userId, id));
    });
}

export async function getUserDataByUserId(id: string) {
    const data = await db.select().from(userData).where(eq(userData.userId, id));

    if (data.length === 0) {
        return null;
    }

    return data[0];
}

export async function deleteUser(id: string) {
    return db.delete(user).where(eq(user.id, id));
}

export async function getAllUsers() {
    return db.select().from(user);
}

export async function setUserActive(id: string, isActive: boolean) {
    return db.update(user).set({ isActive }).where(eq(user.id, id));
}

export async function setUserAdmin(id: string, isAdmin: boolean) {
    return db.update(user).set({ isAdmin }).where(eq(user.id, id));
}

export async function createToken(userId: string, type: TokenType = TokenType.Report) {
    return db.transaction(async (trx) => {
        await trx.insert(token).values({ userId });

        const createdToken = await trx
            .select()
            .from(token)
            .where(and(eq(token.userId, userId)))
            .orderBy(desc(token.createdTimestamp))
            .limit(1);
        return createdToken[0].token;
    });
}

export async function getUserIdByToken(givenToken: string) {
    const data = await db.select().from(token).where(eq(token.token, givenToken));
    if (data.length === 0) {
        return null;
    }
    return data[0].userId;
}
