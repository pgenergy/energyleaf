"use server";

import { env } from "@/env.mjs";
import { getActionSession } from "@/lib/auth/auth.action";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { logError, trackAction } from "@energyleaf/postgres/query/logs";
import { type IDefaultActionReturnPayload, UserNotLoggedInError } from "@energyleaf/lib";
import { waitUntil } from "@vercel/functions";
import type { Session } from "lucia";

interface Co2PredictionOutput {
    timestamp: Date;
    value: number;
}

export const calculateCO2eqEmissions = async (startDate: string, endDate: string): Promise<IDefaultActionReturnPayload<number>> => {
    let session: Session | null = null;
    try {
        const { session: actionSession, user } = await getActionSession();
        session = actionSession;

        if (!session || !user) {
            throw new UserNotLoggedInError();
        }

        const sensorId = await getElectricitySensorIdForUser(user.id);
        if (!sensorId) {
            throw Error("Sensor not found");
        }

        const energyData = await getEnergyDataForSensor(startDate, endDate, sensorId);
        const emissions = await getCO2Emissions(energyData);

        waitUntil(trackAction("co2/success", "calculate-co2eq-emissions", "web", { payload: emissions }));
        return {
            success: true,
            payload: emissions.reduce((prev, curr) => prev + curr.value, 0),
            message: "",
        };
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            waitUntil(logError("user/not-logged-in", "calculate-co2", "web", { session }, err));
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um dies zu bearbeiten.",
            };
        }
        waitUntil(logError("solar/error", "calculate-co2", "web", { session }, err));
        return {
            success: false,
            message: "Ein Fehler ist aufgetreten.",
        };
    }
};

const getCO2Emissions = async (energyData: { timestamp: Date, value: number }[]) => {

    const response = await fetch(
        `${env.ML_API_URL}/v1/co2prediction`,
        {
            method: "POST",
            headers: {
                "x-api-key": env.ML_API_KEY,
            },
            body: JSON.stringify(energyData.map(x => ({ timestamp: x.timestamp, value: x.value }))),
        },
    );

    return (await response.json()).data as Co2PredictionOutput[];
};
