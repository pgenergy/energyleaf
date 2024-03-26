import { eq } from "drizzle-orm";

import db from "../";
import { historyUserData, mail, user, userData } from "../schema";

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
 * Get the current user data from the database
 */
export async function getUserData(id: string) {
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
export async function updateUser(data: Partial<CreateUserType>, id: string) {
    return await db.update(user).set(data).where(eq(user.id, id));
}

/**
 * Update the user's password in the database
 */
export async function updatePassword(data: Partial<CreateUserType>, id: string) {
    return await db.update(user).set(data).where(eq(user.id, id));
}

/**
 * Update the user mail settings data in the database
 */
export async function updateMailSettings(data: { daily: boolean; weekly: boolean }, id: string) {
    return await db
        .update(mail)
        .set({
            mailDaily: data.daily,
            mailWeekly: data.weekly,
        })
        .where(eq(mail.userId, id));
}

type UpdateUserData = {
    tariff: (typeof userData.tariff.enumValues)[number];
    property: (typeof userData.property.enumValues)[number];
    livingSpace: number;
    hotWater: (typeof userData.hotWater.enumValues)[number];
    household: number;
    basePrice: number;
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

        await trx.insert(historyUserData).values({...oldUserData, id: undefined});
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
    return await db.delete(user).where(eq(user.id, id));
}

export async function getAllUsers() {
    return await db.select().from(user);
}

export async function setUserActive(id: string, isActive: boolean) {
    return await db.update(user).set({ isActive }).where(eq(user.id, id));
}

export async function setUserAdmin(id: string, isAdmin: boolean) {
    return await db.update(user).set({ isAdmin }).where(eq(user.id, id));
}
