import { pickRandomTip } from "@energyleaf/lib/tips";
import type { EnergyTipKey } from "@energyleaf/lib/tips";
import { and, between, desc, eq, gte } from "drizzle-orm";
import { db, genId } from "../";
import { historyReportConfigTable, reportConfigTable } from "../schema/reports";
import { sensorHistoryTable, sensorTable } from "../schema/sensor";
import {
    historyUserDataTable,
    historyUserTable,
    sessionTable,
    tokenTable,
    userDataTable,
    userExperimentDataTable,
    userTable,
    userTipOfTheDayTable,
} from "../schema/user";
import type { UserDataSelectType, UserSelectType } from "../types/types";
import { getDeviceCategoriesByUser } from "./device";

/**
 * Get a user by id from the database
 *
 * @param id<number> The id of the user
 *
 * @returns The user or null if not found
 */
export async function getUserById(id: string) {
    const query = await db.select().from(userTable).where(eq(userTable.id, id));
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
    return await db.delete(sessionTable).where(eq(sessionTable.userId, id));
}

/**
 * Get user experiment data
 *
 * @param userId<string> The id of the user
 */
export async function getUserExperimentData(userId: string) {
    const data = await db.select().from(userExperimentDataTable).where(eq(userExperimentDataTable.userId, userId));
    if (!data || data.length === 0) {
        return null;
    }

    return data[0];
}

/**
 * Create experiment data for a user
 */
export async function createExperimentDataForUser(data: typeof userExperimentDataTable.$inferInsert) {
    return await db.insert(userExperimentDataTable).values({
        ...data,
    });
}

/**
 * Update experiment data for a user
 */
export async function updateExperimentDataForUser(
    data: Partial<typeof userExperimentDataTable.$inferInsert>,
    id: string,
) {
    return await db.update(userExperimentDataTable).set(data).where(eq(userExperimentDataTable.userId, id));
}

/**
 * Delete experiment data for a user
 */
export async function deleteExperimentDataForUser(id: string) {
    return await db.delete(userExperimentDataTable).where(eq(userExperimentDataTable.userId, id));
}

/**
 * Get all users who recive an survey mail
 */
export async function getUsersWhoRecieveSurveyMail(startDate: Date, endDate: Date) {
    return await db
        .select()
        .from(userTable)
        .innerJoin(userExperimentDataTable, eq(userTable.id, userExperimentDataTable.userId))
        .where(
            and(
                between(userExperimentDataTable.installationDate, startDate, endDate),
                eq(userTable.isParticipant, true),
                eq(userTable.isActive, true),
                eq(userExperimentDataTable.usesProlific, false),
                eq(userExperimentDataTable.getsPaid, true),
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
            .from(historyUserDataTable)
            .where(eq(historyUserDataTable.userId, id))
            .union(trx.select().from(userDataTable).where(eq(userDataTable.userId, id)))
            .orderBy(historyUserDataTable.timestamp);
    });
}

/**
 * Get all users who recive anomaly mails
 */
export async function getUsersWhoRecieveAnomalyMail() {
    return await db
        .select()
        .from(userTable)
        .innerJoin(sensorTable, eq(sensorTable.userId, userTable.id))
        .where(eq(userTable.receiveAnomalyMails, true));
}

/**
 * Return all users who are in the experiment and getting paid
 */
export async function getAllExperimentUsers() {
    return await db
        .select()
        .from(userTable)
        .innerJoin(userExperimentDataTable, eq(userTable.id, userExperimentDataTable.userId))
        .where(
            and(
                eq(userTable.isParticipant, true),
                eq(userExperimentDataTable.experimentStatus, "approved"),
                gte(userExperimentDataTable.experimentNumber, 0),
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
    const query = await db.select().from(userTable).where(eq(userTable.email, email));
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
    electricityMeterType: (typeof userDataTable.electricityMeterType.enumValues)[number];
    electricityMeterNumber: string;
    participation: boolean;
    meterImgUrl?: string;
};

/**
 * Create a user in the database
 */
export async function createUser(data: CreateUserType) {
    return db.transaction(async (trx) => {
        const check = await trx.select().from(userTable).where(eq(userTable.email, data.email));

        if (check.length > 0) {
            throw new Error("User already exists");
        }
        const userId = genId(30);

        await trx.insert(userTable).values({
            id: userId,
            firstname: data.firstname,
            lastname: data.lastname,
            address: data.address,
            phone: data.phone,
            username: data.username,
            email: data.email,
            password: data.password,
            isParticipant: data.participation,
        });
        await trx.insert(userDataTable).values({
            userId,
            electricityMeterNumber: data.electricityMeterNumber,
            electricityMeterType: data.electricityMeterType,
            electricityMeterImgUrl: data.meterImgUrl || null,
            powerAtElectricityMeter: data.hasPower,
            wifiAtElectricityMeter: data.hasWifi,
            installationComment: data.comment,
        });
        await trx.insert(reportConfigTable).values({
            userId,
            timestampLast: new Date(),
        });

        if (data.participation) {
            await trx.insert(userExperimentDataTable).values({
                userId,
                getsPaid: true,
            });
        }
    });
}

/**
 * Get the current user data from the database
 */
export async function getUserData(id: string): Promise<UserDataSelectType | null> {
    const data = await db.select().from(userDataTable).where(eq(userDataTable.userId, id));

    if (data.length === 0) {
        return null;
    }

    return data[0];
}

/**
 * Update the user data in the database
 */
export async function updateUser(data: Partial<UserSelectType>, id: string) {
    return db.update(userTable).set(data).where(eq(userTable.id, id));
}

/**
 * Update the user's password in the database
 */
export async function updatePassword(data: Partial<CreateUserType>, id: string) {
    return db.update(userTable).set(data).where(eq(userTable.id, id));
}

export async function updateUserData(data: Partial<typeof userDataTable.$inferInsert>, id: string) {
    return db.transaction(async (trx) => {
        const oldUserData = await getUserDataByUserId(id);
        if (!oldUserData) {
            throw new Error("Old user data not found");
        }

        await trx.insert(historyUserDataTable).values({ ...oldUserData });
        await trx.update(userDataTable).set(data).where(eq(userDataTable.userId, id));
    });
}

export async function getUserDataByUserId(id: string) {
    const data = await db.select().from(userDataTable).where(eq(userDataTable.userId, id));

    if (data.length === 0) {
        return null;
    }

    return data[0];
}

export async function deleteUser(id: string) {
    return db.transaction(async (trx) => {
        const currentData = await trx
            .select()
            .from(userTable)
            .leftJoin(reportConfigTable, eq(reportConfigTable.userId, userTable.id))
            .where(eq(userTable.id, id));
        if (currentData.length <= 0) {
            return;
        }
        const data = currentData[0];

        // delete user and remove private data
        await trx.insert(historyUserTable).values({
            ...data.user,
            firstname: "",
            lastname: "",
            phone: "",
            address: "",
            username: "",
            email: "",
            password: "",
        });
        await trx.delete(userTable).where(eq(userTable.id, id));

        if (data.report_config) {
            // delete reports
            await trx.insert(historyReportConfigTable).values({
                ...data.report_config,
            });
            await trx.delete(reportConfigTable).where(eq(reportConfigTable.userId, data.report_config.userId));
        }

        // sensor actions
        const sensorDb = await trx.select().from(sensorTable).where(eq(sensorTable.userId, data.user.id));

        if (sensorDb.length <= 0) {
            return;
        }

        // remove user id from sensor and give new id
        await trx.update(sensorTable).set({
            id: genId(30),
            userId: null,
        });

        await trx.insert(sensorHistoryTable).values({
            userId: data.user.id,
            sensorType: sensorDb[0].sensorType,
            sensorId: sensorDb[0].id,
            clientId: sensorDb[0].clientId,
        });
    });
}

export async function getAllUsers() {
    return db.select().from(userTable);
}

export async function setUserActive(id: string, isActive: boolean, date: Date) {
    return db.update(userTable).set({ isActive, activationDate: date }).where(eq(userTable.id, id));
}

export async function setUserAdmin(id: string, isAdmin: boolean) {
    return db.update(userTable).set({ isAdmin }).where(eq(userTable.id, id));
}

export async function createToken(userId: string) {
    return db.transaction(async (trx) => {
        await trx.insert(tokenTable).values({ userId });

        const createdToken = await trx
            .select()
            .from(tokenTable)
            .where(and(eq(tokenTable.userId, userId)))
            .orderBy(desc(tokenTable.createdTimestamp))
            .limit(1);
        return createdToken[0].token;
    });
}

export async function getUserIdByToken(givenToken: string) {
    const data = await db.select().from(tokenTable).where(eq(tokenTable.token, givenToken));
    if (data.length === 0) {
        return null;
    }
    return data[0].userId;
}

export async function getTipOfTheDay(userId: string) {
    return db.transaction(async (trx) => {
        const currentValue = await trx
            .select()
            .from(userTipOfTheDayTable)
            .where(eq(userTipOfTheDayTable.userId, userId));
        const isFirstTip = currentValue.length === 0;
        const isTipOutdated =
            currentValue.length > 0 && currentValue[0].timestamp < new Date(new Date().setHours(0, 0, 0, 0));
        const tip: EnergyTipKey =
            isFirstTip || isTipOutdated
                ? pickRandomTip(await getDeviceCategoriesByUser(userId, trx))
                : currentValue[0].tipId;

        if (isFirstTip) {
            await trx.insert(userTipOfTheDayTable).values({
                userId,
                tipId: tip,
                timestamp: new Date(),
            });
        }

        if (isTipOutdated) {
            await trx
                .update(userTipOfTheDayTable)
                .set({
                    tipId: tip,
                    timestamp: new Date(),
                })
                .where(eq(userTipOfTheDayTable.userId, userId));
        }

        return tip;
    });
}
