import { db, genId } from "..";
import { sensorTable, sensorTokenTable } from "../schema/sensor";
import { eq } from "drizzle-orm";

export async function createSensorToken(clientId: string) {
    const dbReturn = await db.transaction(async (trx) => {
        const sensorData = await trx.select().from(sensorTable).where(eq(sensorTable.clientId, clientId));
        if (sensorData.length === 0) {
            return {
                error: "sensor/not-found",
                code: null,
            };
        }

        if (!sensorData[0].userId) {
            return {
                error: "sensor/no-user",
                code: null,
            };
        }

        const tokenData = await trx
            .select()
            .from(sensorTokenTable)
            .where(eq(sensorTokenTable.sensorId, sensorData[0].id));
        if (tokenData.length > 0) {
            await trx.delete(sensorTokenTable).where(eq(sensorTokenTable.sensorId, sensorData[0].id));
        }

        const code = genId(30);
        await trx.insert(sensorTokenTable).values({
            code: code,
            sensorId: sensorData[0].id,
        });

        return {
            error: null,
            code: code,
        };
    });

    const { error, code } = dbReturn;

    if (error) {
        throw new Error(error);
    }

    if (!code) {
        throw new Error("sensor/not-found");
    }

    return code;
}

export async function getSensorIdFromSensorToken(code: string) {
    const dbReturn = await db.transaction(async (trx) => {
        const tokenData = await trx.select().from(sensorTokenTable).where(eq(sensorTokenTable.code, code));

        if (tokenData.length === 0) {
            return {
                error: "token/not-found",
                sensorId: null,
            };
        }

        const token = tokenData[0];
        const tokenDate = token.timestamp;

        if (!tokenDate) {
            await trx.delete(sensorTokenTable).where(eq(sensorTokenTable.sensorId, token.sensorId));
            return {
                error: "token/invalid",
                sensorId: null,
            };
        }

        // check if token is older than 1 hour
        const now = new Date();
        if (now.getTime() - tokenDate.getTime() > 3600000) {
            await trx.delete(sensorTokenTable).where(eq(sensorTokenTable.sensorId, token.sensorId));
            return {
                error: "token/invalid",
                sensorId: null,
            };
        }

        const sensorData = await trx.select().from(sensorTable).where(eq(sensorTable.id, token.sensorId));
        if (sensorData.length === 0) {
            return {
                error: "sensor/not-found",
                sensorId: null,
            };
        }

        if (!sensorData[0].userId) {
            return {
                error: "sensor/no-user",
                sensorId: null,
            };
        }

        return {
            error: null,
            sensorId: sensorData[0].id,
        };
    });

    const { error, sensorId } = dbReturn;

    if (error) {
        throw new Error(error);
    }

    if (!sensorId) {
        throw new Error("sensor/not-found");
    }

    return sensorId;
}
