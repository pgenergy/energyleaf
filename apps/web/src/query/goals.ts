import { GoalState, GoalStatus } from "@/types/goals";
import { AggregationType, convertTZDate } from "@energyleaf/lib";
import { endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { cache } from "react";
import { getEnergyDataForSensor } from "./energy";
import { getUserData } from "./user";

export const getGoalStatus = cache(async (userId: string, sensorId: string) => {
    const dateNow = new Date();
    const userData = await getUserData(userId);
    if (!userData) {
        throw new Error("User data not found");
    }

    const userDailyLimit = userData.consumptionGoal;
    if (!userDailyLimit) {
        return [];
    }

    return await Promise.all([
        dailyGoalStatus(sensorId, userDailyLimit, dateNow),
        weeklyGoalStatus(sensorId, userDailyLimit, dateNow),
        monthlyGoalStatus(sensorId, userDailyLimit, dateNow),
    ]);
});

async function dailyGoalStatus(sensorId: string, dailyLimit: number, dateNow: Date): Promise<GoalStatus> {
    const serverStart = startOfDay(dateNow);
    const serverEnd = endOfDay(dateNow);

    const start = convertTZDate(serverStart);
    const end = convertTZDate(serverEnd);

    const data = await getEnergyDataForSensor(
        start.toISOString(),
        end.toISOString(),
        sensorId,
        AggregationType.DAY,
        "sum",
    );
    const sumOfDay = data.reduce((acc, cur) => acc + cur.consumption, 0);
    return new GoalStatus(dailyLimit, sumOfDay, calculateState(sumOfDay, dailyLimit, dateNow.getHours(), 24), "Tag");
}

async function weeklyGoalStatus(sensorId: string, dailyLimit: number, dateNow: Date): Promise<GoalStatus> {
    const serverStart = startOfWeek(dateNow, { weekStartsOn: 1 });
    const serverEnd = endOfWeek(dateNow, { weekStartsOn: 1 });

    const start = convertTZDate(serverStart);
    const end = convertTZDate(serverEnd);

    const data = await getEnergyDataForSensor(
        start.toISOString(),
        end.toISOString(),
        sensorId,
        AggregationType.WEEK,
        "sum",
    );
    const sumOfWeek = data.reduce((acc, cur) => acc + cur.consumption, 0);
    const weeklyLimit = dailyLimit * 7;
    return new GoalStatus(weeklyLimit, sumOfWeek, calculateState(sumOfWeek, weeklyLimit, dateNow.getDay(), 7), "Woche");
}

async function monthlyGoalStatus(sensorId: string, dailyLimit: number, dateNow: Date): Promise<GoalStatus> {
    const serverStart = startOfMonth(dateNow);
    const serverEnd = endOfMonth(dateNow);

    const start = convertTZDate(serverStart);
    const end = convertTZDate(serverEnd);

    const data = await getEnergyDataForSensor(
        start.toISOString(),
        end.toISOString(),
        sensorId,
        AggregationType.MONTH,
        "sum",
    );
    const sumOfMonth = data.reduce((acc, cur) => acc + cur.consumption, 0);
    const monthlyLimit = dailyLimit * new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0).getDate();
    return new GoalStatus(
        monthlyLimit,
        sumOfMonth,
        calculateState(
            sumOfMonth,
            monthlyLimit,
            dateNow.getDate(),
            new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0).getDate(),
        ),
        "Monat",
    );
}

function calculateState(
    consumed: number,
    limit: number,
    passedTimeUnits: number,
    timeUnitsInPeriod: number,
): GoalState {
    if (consumed >= limit) {
        return GoalState.EXCEEDED;
    }

    const avgConsumed = consumed / passedTimeUnits;
    const consumptionPrediction = avgConsumed * timeUnitsInPeriod;
    if (consumptionPrediction > limit) {
        return GoalState.IN_DANGER;
    }

    return GoalState.GOOD;
}
