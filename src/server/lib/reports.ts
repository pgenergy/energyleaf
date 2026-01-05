import { getDaysInMonth } from "date-fns";
import type { DayReport } from "@/server/db/tables/reports";
import type { UserData } from "@/server/db/tables/user";

interface DayData {
	timestamp: Date;
	consumption: number;
}

interface GenerateReportParams {
	dayData: DayData[];
	userData: UserData;
	startDate: Date;
	endDate: Date;
}

/**
 * Finds the previous configured report day from a given day of week.
 * Days are 0-6 where 0=Sunday, 1=Monday, ..., 6=Saturday.
 *
 * Example: If configured days are [1, 5] (Monday, Friday):
 * - If today is Friday (5), previous report day is Monday (1)
 * - If today is Monday (1), previous report day is Friday (5)
 *
 * If only one day is configured (e.g., [1] = Monday only):
 * - Returns the same day (report covers the full week)
 * - Monday (1) -> Monday (1), meaning 7 days back
 */
export function getPreviousReportDay(currentDay: number, configuredDays: number[]): number | null {
	if (configuredDays.length === 0) {
		return null;
	}

	const sortedDays = [...configuredDays].sort((a, b) => a - b);

	const currentIndex = sortedDays.indexOf(currentDay);
	if (currentIndex === -1) {
		return null;
	}

	if (sortedDays.length === 1) {
		return currentDay;
	}

	const previousIndex = currentIndex === 0 ? sortedDays.length - 1 : currentIndex - 1;
	return sortedDays[previousIndex];
}

/**
 * Calculate the number of days between two days of the week.
 * Goes backwards from currentDay to previousDay.
 *
 * Example: Friday (5) to Monday (1) = 4 days back
 * Example: Monday (1) to Friday (5) = 3 days back (wraps around weekend)
 * Example: Monday (1) to Monday (1) = 7 days back (full week)
 */
export function getDaysBetween(currentDay: number, previousDay: number): number {
	if (currentDay === previousDay) {
		return 7;
	}
	if (currentDay > previousDay) {
		return currentDay - previousDay;
	}

	return 7 - previousDay + currentDay;
}

/**
 * Generates a DayReport from aggregated daily energy data.
 * Returns null if no data is provided.
 */
export function generateReport({ dayData, userData, startDate }: GenerateReportParams): DayReport | null {
	if (dayData.length === 0) {
		return null;
	}

	const workingPrice = userData.workingPrice ?? 0;
	const basePrice = userData.basePrice ?? 0;
	const consumptionGoal = userData.consumptionGoal ?? 0;

	// Calculate totals
	const totalEnergyConsumption = dayData.reduce((sum, d) => sum + d.consumption, 0);
	const avgEnergyConsumptionPerDay = totalEnergyConsumption / dayData.length;

	// Calculate costs (base price prorated by days in month)
	const daysInMonth = getDaysInMonth(startDate);
	const dailyBaseCost = basePrice / daysInMonth;
	const totalEnergyCost = totalEnergyConsumption * workingPrice + dailyBaseCost * dayData.length;
	const avgEnergyCost = totalEnergyCost / dayData.length;

	// Find best/worst days (best = lowest consumption, worst = highest consumption)
	const sorted = [...dayData].sort((a, b) => a.consumption - b.consumption);
	const bestDayData = sorted[0];
	const worstDayData = sorted[sorted.length - 1];

	// Daily goal (prorated from monthly goal)
	const dailyGoal = consumptionGoal > 0 ? consumptionGoal / daysInMonth : 0;

	// Build days array with detailed breakdown
	const days = dayData.map((d) => {
		const cost = d.consumption * workingPrice + dailyBaseCost;
		const exceeded = dailyGoal > 0 && d.consumption > dailyGoal;
		const progress = dailyGoal > 0 ? Math.min((d.consumption / dailyGoal) * 100, 100) : 0;

		return {
			timestamp: d.timestamp.toISOString(),
			consumption: d.consumption,
			cost,
			goal: dailyGoal,
			exceeded,
			progress,
		};
	});

	return {
		totalEnergyConsumption,
		avgEnergyConsumptionPerDay,
		totalEnergyCost,
		avgEnergyCost,
		worstDay: worstDayData.timestamp.toISOString(),
		worstDayConsumption: worstDayData.consumption,
		bestDay: bestDayData.timestamp.toISOString(),
		bestDayConsumption: bestDayData.consumption,
		days,
	};
}
