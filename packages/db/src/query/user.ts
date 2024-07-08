import { and, desc, eq, gte } from "drizzle-orm";
import db, { genId } from "../";
import {
    historyReportConfig,
    historyUser,
    historyUserData,
    reportConfig,
    sensor,
    sensorHistory,
    session,
    token,
    user,
    userData,
    userExperimentData,
} from "../schema";
import type { UserDataSelectType, UserSelectType } from "../types/types";

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
 * Delete all sessions of a user
 *
 * @param id<string> The id of the user
 */
export async function deleteSessionsOfUser(id: string) {
    return await db.delete(session).where(eq(session.userId, id));
}

/**
 * Get user experiment data
 *
 * @param userId<string> The id of the user
 */
export async function getUserExperimentData(userId: string) {
    const data = await db.select().from(userExperimentData).where(eq(userExperimentData.userId, userId));
    if (!data || data.length === 0) {
        return null;
    }

    return data[0];
}

/**
 * Create experiment data for a user
 */
export async function createExperimentDataForUser(data: typeof userExperimentData.$inferInsert) {
    return await db.insert(userExperimentData).values({
        ...data,
    });
}

/**
 * Update experiment data for a user
 */
export async function updateExperimentDataForUser(data: Partial<typeof userExperimentData.$inferInsert>, id: string) {
    return await db.update(userExperimentData).set(data).where(eq(userExperimentData.userId, id));
}

/**
 * Delete experiment data for a user
 */
export async function deleteExperimentDataForUser(id: string) {
    return await db.delete(userExperimentData).where(eq(userExperimentData.userId, id));
}

/**
 * Get all users who recive an survey mail
 */
export async function getUsersWhoRecieveSurveyMail(date: Date) {
    return await db
        .select()
        .from(user)
        .innerJoin(userExperimentData, eq(user.id, userExperimentData.userId))
        .where(
            and(
                eq(user.activationDate, date),
                eq(user.isParticipant, true),
                eq(user.isActive, true),
                eq(userExperimentData.getsPaid, false),
            ),
        );
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
 * Get all users who recive anomaly mails
 */
export async function getUsersWhoRecieveAnomalyMail() {
    return await db
        .select()
        .from(user)
        .innerJoin(sensor, eq(sensor.userId, user.id))
        .where(eq(user.receiveAnomalyMails, true));
}

/**
 * Return all users who are in the experiment and getting paid
 */
export async function getAllExperimentUsers() {
    return await db
        .select()
        .from(user)
        .innerJoin(userExperimentData, eq(user.id, userExperimentData.userId))
        .where(
            and(
                eq(user.isParticipant, true),
                eq(userExperimentData.experimentStatus, "approved"),
                gte(userExperimentData.experimentNumber, 0),
            ),
        );
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
    electricityMeterNumber: string;
    participation: boolean;
    prolific: boolean;
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
        const userId = genId(30);

        await trx.insert(user).values({
            id: userId,
            firstname: data.firstname,
            lastName: data.lastname,
            address: data.address,
            phone: data.phone,
            username: data.username,
            email: data.email,
            password: data.password,
            isParticipant: data.participation || data.prolific,
        });
        await trx.insert(userData).values({
            userId,
            electricityMeterNumber: data.electricityMeterNumber,
            electricityMeterType: data.electricityMeterType,
            electricityMeterImgUrl: data.meterImgUrl || null,
            powerAtElectricityMeter: data.hasPower,
            wifiAtElectricityMeter: data.hasWifi,
            installationComment: data.comment,
        });
        await trx.insert(reportConfig).values({
            userId,
            timestampLast: new Date(),
        });

        if (data.participation || data.prolific) {
            await trx.insert(userExperimentData).values({
                userId,
                getsPaid: data.prolific,
            });
        }
    });
}

/**
 * Get the current user data from the database
 */
export async function getUserData(id: string): Promise<UserDataSelectType | null> {
    const data = await db.select().from(userData).where(eq(userData.userId, id));

    if (data.length === 0) {
        return null;
    }

    return data[0];
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
    return db.update(user).set(data).where(eq(user.id, id));
}

export async function updateUserData(data: Partial<typeof userData.$inferInsert>, id: string) {
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
    return db.transaction(async (trx) => {
        const currentData = await trx
            .select()
            .from(user)
            .leftJoin(reportConfig, eq(reportConfig.userId, user.id))
            .where(eq(user.id, id));
        if (currentData.length <= 0) {
            return;
        }
        const data = currentData[0];

        // delete user and remove private data
        await trx.insert(historyUser).values({
            ...data.user,
            firstname: "",
            lastName: "",
            phone: "",
            address: "",
            username: "",
            email: "",
            password: "",
        });
        await trx.delete(user).where(eq(user.id, id));

        if (data.report_config) {
            // delete reports
            await trx.insert(historyReportConfig).values({
                ...data.report_config,
            });
            await trx.delete(reportConfig).where(eq(reportConfig.userId, data.report_config.userId));
        }

        // sensor actions
        const sensorDb = await trx.select().from(sensor).where(eq(sensor.userId, data.user.id));

        if (sensorDb.length <= 0) {
            return;
        }

        // remove user id from sensor and give new id
        await trx.update(sensor).set({
            id: genId(30),
            userId: null,
        });

        await trx.insert(sensorHistory).values({
            userId: data.user.id,
            sensorType: sensorDb[0].sensorType,
            sensorId: sensorDb[0].id,
            clientId: sensorDb[0].clientId,
        });
    });
}

export async function getAllUsers() {
    return db.select().from(user);
}

export async function setUserActive(id: string, isActive: boolean, date: Date) {
    return db.update(user).set({ isActive, activationDate: date }).where(eq(user.id, id));
}

export async function setUserAdmin(id: string, isAdmin: boolean) {
    return db.update(user).set({ isAdmin }).where(eq(user.id, id));
}

export async function createToken(userId: string) {
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
