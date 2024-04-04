import {cache} from "react";
import {GoalStatus, GoalState} from "@/types/goals";
import {getEnergySumForSensorInRange} from "@energyleaf/db/query";
import {getDemoGoalStatus} from "@/lib/demo/demo";
import {getUserData} from "@/query/user";
import {endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek} from "date-fns";

export const getGoalStatus = cache(async(userId: string, sensorId: string) => {
    const dateNow = new Date();
    const userData = (await getUserData(userId))?.user_data;
    if (!userData) {
        throw new Error("User data not found");
    }

    const userDailyLimit = userData.consumptionGoal;
    if (!userDailyLimit) {
        return [];
    }

    if (userId === "demo") {
        return getDemoGoalStatus(userDailyLimit);
    }

    return await Promise.all([
        dailyGoalStatus(sensorId, userDailyLimit, dateNow),
        weeklyGoalStatus(sensorId, userDailyLimit, dateNow),
        monthlyGoalStatus(sensorId, userDailyLimit, dateNow)
    ]);
})

async function dailyGoalStatus(sensorId: string, dailyLimit: number, dateNow: Date): Promise<GoalStatus> {
    const start = startOfDay(dateNow);
    const end = endOfDay(dateNow);

    const sumOfDay = await getEnergySumForSensorInRange(start, end, sensorId);
    return new GoalStatus(
        dailyLimit,
        sumOfDay,
        calculateState(sumOfDay, dailyLimit, dateNow.getHours(), 24),
        "Tag"
    );
}

async function weeklyGoalStatus(sensorId: string, dailyLimit: number, dateNow: Date): Promise<GoalStatus> {
    const start = startOfWeek(dateNow, { weekStartsOn: 1 });
    const end = endOfWeek(dateNow, { weekStartsOn: 1 });

    const sumOfWeek = await getEnergySumForSensorInRange(start, end, sensorId);
    const weeklyLimit = dailyLimit * 7;
    return new GoalStatus(
        weeklyLimit,
        sumOfWeek,
        calculateState(sumOfWeek, weeklyLimit, dateNow.getDay(), 7),
        "Woche"
    );
}

async function monthlyGoalStatus(sensorId: string, dailyLimit: number, dateNow: Date): Promise<GoalStatus> {
    const start = startOfMonth(dateNow);
    const end = endOfMonth(dateNow);

    const sumOfMonth = await getEnergySumForSensorInRange(start, end, sensorId);
    const monthlyLimit = dailyLimit * new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0).getDate();
    return new GoalStatus(
        monthlyLimit,
        sumOfMonth,
        calculateState(
            sumOfMonth,
            monthlyLimit,
            dateNow.getDate(),
            new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0).getDate()
        ),
        "Monat"
    );
}

function calculateState(consumed: number, limit: number, passedTimeUnits: number, timeUnitsInPeriod: number): GoalState {
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