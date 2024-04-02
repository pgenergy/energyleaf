import {cache} from "react";
import {type Goal, GoalState} from "@/types/goals";
import {getEnergySumForSensorInRange} from "@energyleaf/db/query";
import {getDemoGoals} from "@/lib/demo/demo";
import {getUserData} from "@/query/user";
import {endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek} from "date-fns";

export const getGoals = cache(async(userId: string, sensorId: string) => {
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
        return getDemoGoals(userDailyLimit);
    }

    return await Promise.all([
        dailyGoal(sensorId, userDailyLimit, dateNow),
        weeklyGoal(sensorId, userDailyLimit, dateNow),
        monthlyGoal(sensorId, userDailyLimit, dateNow)
    ]);
})

async function dailyGoal(sensorId: string, dailyLimit: number, dateNow: Date): Promise<Goal> {
    const start = startOfDay(dateNow);
    const end = endOfDay(dateNow);

    const sumOfDay = await getEnergySumForSensorInRange(start, end, sensorId);
    return {
        goalName: "Tag",
        goalValue: dailyLimit,
        currentValue: sumOfDay,
        state: calculateState(sumOfDay, dailyLimit, dateNow.getHours(), 24)
    }
}

async function weeklyGoal(sensorId: string, dailyLimit: number, dateNow: Date): Promise<Goal> {
    const start = startOfWeek(dateNow, { weekStartsOn: 1 });
    const end = endOfWeek(dateNow, { weekStartsOn: 1 });

    const sumOfWeek = await getEnergySumForSensorInRange(start, end, sensorId);
    const weeklyLimit = dailyLimit * 7;
    return {
        goalName: "Woche",
        goalValue: weeklyLimit,
        currentValue: sumOfWeek,
        state: calculateState(sumOfWeek, weeklyLimit, dateNow.getDay(), 7)
    }
}

async function monthlyGoal(sensorId: string, dailyLimit: number, dateNow: Date): Promise<Goal> {
    const start = startOfMonth(dateNow);
    const end = endOfMonth(dateNow);

    const sumOfMonth = await getEnergySumForSensorInRange(start, end, sensorId);
    const monthlyLimit = dailyLimit * new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0).getDate();
    return {
        goalName: "Monat",
        goalValue: monthlyLimit,
        currentValue: sumOfMonth,
        state: calculateState(
            sumOfMonth,
            monthlyLimit,
            dateNow.getDate(),
            new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0).getDate()
        )
    }
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