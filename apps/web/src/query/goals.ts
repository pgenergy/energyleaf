import {cache} from "react";
import {Goal, GoalState} from "@/types/goals";
import {getEnergySumForSensorInRange, getUserDataByUserId} from "@energyleaf/db/query";
import {getDemoGoals} from "@/lib/demo/demo";
import {getUserData} from "@/query/user";

export const getGoals = cache(async(userId: string, sensorId: string) => {
    const dateNow = new Date();
    const userData = (await getUserData(userId)).user_data;
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
    const startOfDay = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), 0, 0, 0);
    const endOfDay = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), 23, 59, 59);

    const sumOfDay = await getEnergySumForSensorInRange(startOfDay, endOfDay, sensorId) ?? 0;
    return {
        goalName: "Tag",
        goalValue: dailyLimit,
        currentValue: sumOfDay,
        state: calculateState(sumOfDay, dailyLimit, dateNow.getHours(), 24)
    }
}

async function weeklyGoal(sensorId: string, dailyLimit: number, dateNow: Date): Promise<Goal> {
    const dayOfWeek = dateNow.getDay();
    const startOfWeek = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1), 0, 0, 0);
    const endOfWeek = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate() + (dayOfWeek === 0 ? 0 : 7 - dayOfWeek), 23, 59, 59);

    const sumOfWeek = await getEnergySumForSensorInRange(startOfWeek, endOfWeek, sensorId) ?? 0;
    const weeklyLimit = dailyLimit * 7;
    return {
        goalName: "Woche",
        goalValue: weeklyLimit,
        currentValue: sumOfWeek,
        state: calculateState(sumOfWeek, weeklyLimit, dateNow.getDay(), 7)
    }
}

async function monthlyGoal(sensorId: string, dailyLimit: number, dateNow: Date): Promise<Goal> {
    const startOfMonth = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1, 0, 0, 0);
    const endOfMonth = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0, 23, 59, 59);

    const sumOfMonth = await getEnergySumForSensorInRange(startOfMonth, endOfMonth, sensorId) ?? 0;
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
    if (consumed > limit) {
        return GoalState.EXCEEDED;
    }

    const avgConsumed = consumed / passedTimeUnits;
    const consumptionPrediction = avgConsumed * timeUnitsInPeriod;
    if (consumptionPrediction > limit) {
        return GoalState.IN_DANGER;
    }

    return GoalState.GOOD;
}