import { eq } from "drizzle-orm";

import db from "../";
import { historyUserData, mail, token, user, userData } from "../schema";

/**
 * Get a user by id from the database
 *
 * @param id<number> The id of the user
 *
 * @returns The user or null if not found
 */
export async function getUserById(id: number) {
    const query = await db.select().from(user).where(eq(user.id, id));
    if (query.length === 0) {
        return null;
    }
    return query[0];
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

export type CreateTokenType = {
    tokenId: string;
    userId: number;
    create: Date;
};

export async function createToken(data: CreateTokenType) {
    return db.transaction(async (trx) => {
        const check = await trx.select().from(token).where(eq(token.tokenId, data.tokenId));

        if (check.length > 0) {
            throw new Error("Token already exists");
        }

        await trx.insert(token).values(data);
    });
}

/**
 * Get a password reset token
 *
 * @param token_id<string?> The password reset token id
 *
 * @returns The password reset or null if not found
 */
export async function getToken(token_id: string | null) {
    if (token_id === null) {
        return null;
    }

    const query = await db.select().from(token).where(eq(token.tokenId, token_id));
    if (query.length === 0) {
        return null;
    }
    return query[0];
}

export async function deleteToken(token_id: string) {
    await db.delete(token).where(eq(token.tokenId, token_id));
}

export type CreateUserType = {
    email: string;
    password: string;
    username: string;
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
        });

        await trx.insert(mail).values({
            userId: id,
        });
    });
}

/**
 * Get the user data from the database
 */
export async function getUserData(id: number) {
    const data = await db
        .select()
        .from(userData)
        .innerJoin(mail, eq(userData.userId, mail.userId))
        .where(eq(userData.userId, id));

    if (data.length === 0) {
        return null;
    }

    return data[0];
}

/**
 * Update the user data in the database
 */
export async function updateUser(data: Partial<CreateUserType>, id: number) {
    return await db.update(user).set(data).where(eq(user.id, id));
}

/**
 * Update the user's password in the database
 */
export async function updatePassword(data: Partial<CreateUserType>, id: number) {
    return await db.update(user).set(data).where(eq(user.id, id));
}

/**
 * Update the user mail settings data in the database
 */
export async function updateMailSettings(data: { daily: boolean; weekly: boolean }, id: number) {
    return await db
        .update(mail)
        .set({
            mailDaily: data.daily,
            mailWeekly: data.weekly,
        })
        .where(eq(mail.userId, id));
}

type UpdateUserData = {
    budget: number;
    tariff: (typeof userData.tariff.enumValues)[number];
    property: (typeof userData.property.enumValues)[number];
    livingSpace: number;
    hotWater: (typeof userData.hotWater.enumValues)[number];
    household: number;
    basePrice: number;
    timestamp: Date;
    monthlyPayment: number;
};

export async function updateUserData(data: UpdateUserData, id: number) {
    return db.transaction(async (trx) => {
        const oldUserData = await getUserDataByUserId(id);
        if (!oldUserData) {
            throw new Error("Old user data not found");
        }
        await trx.insert(historyUserData).values({
            userId: oldUserData.userId,
            timestamp: oldUserData.timestamp,
            budget: oldUserData.budget,
            basePrice: oldUserData.basePrice,
            workingPrice: oldUserData.workingPrice,
            tariff: oldUserData.tariff,
            limitEnergy: oldUserData.limitEnergy,
            household: oldUserData.household,
            property: oldUserData.property,
            livingSpace: oldUserData.livingSpace,
            hotWater: oldUserData.hotWater,
            monthlyPayment: oldUserData.monthlyPayment,
        });

        const newHistoryUserData = await trx
            .select({
                id: historyUserData.id,
            })
            .from(historyUserData)
            .where(eq(historyUserData.timestamp, oldUserData.timestamp));

        if (newHistoryUserData.length === 0) {
            throw new Error("History data not found");
        }

        await db.update(userData).set(data).where(eq(userData.userId, id));
    });
}

export async function getUserDataByUserId(id: number) {
    const data = await db.select().from(userData).where(eq(userData.userId, id));

    if (data.length === 0) {
        return null;
    }

    return data[0];
}

export async function deleteUser(id: number) {
    return await db.delete(user).where(eq(user.id, id));
}
