import {
	differenceInDays,
	endOfDay,
	endOfWeek,
	getDaysInMonth,
	startOfDay,
	startOfMonth,
	startOfWeek,
	subDays,
	subWeeks,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { and, between, desc, eq } from "drizzle-orm";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import {
	formatHintText,
	getAvailableHintsForStage,
	getNextStage,
	HINT_LINK_TARGETS,
	HINTS_DAYS_TO_ADVANCE,
	type HintData,
	HintType,
	type HintTypeValue,
	MIN_DATA_DAYS,
	STAGE_HINTS,
} from "@/lib/hints";
import { db } from "@/server/db";
import { deviceTable, deviceToPeakTable } from "@/server/db/tables/device";
import type { HintConfig, HintStage } from "@/server/db/tables/hints";
import { energyDataSequenceTable } from "@/server/db/tables/sensor";
import { userDataTable } from "@/server/db/tables/user";
import { getEnergyForSensorInRange, getEnergySumForSensorInRange } from "@/server/queries/energy";
import { createHint, getOrCreateHintConfig, getRecentHints, updateHintConfig } from "@/server/queries/hints";

interface GenerateHintParams {
	userId: string;
	sensorId: string;
	timezone?: string | null;
}

interface GeneratedHint {
	hintType: HintTypeValue;
	hintStage: HintStage;
	hintText: string;
	linkTarget: string;
}

/**
 * Main function to generate a hint for a user
 */
export async function generateHintForUser({ userId, sensorId, timezone }: GenerateHintParams): Promise<boolean> {
	const tz = TimezoneTypeToTimeZone[timezone as TimeZoneType] || TimezoneTypeToTimeZone[TimeZoneType.Europe_Berlin];
	const now = toZonedTime(new Date(), tz);
	const today = startOfDay(now);

	const hasEnoughData = await checkMinimumData(sensorId, MIN_DATA_DAYS);
	if (!hasEnoughData) {
		return false;
	}

	let config = await getOrCreateHintConfig(userId);
	config = await checkAndAdvanceStage(userId, config);

	const userData = await getUserPricingData(userId);

	const hint = await selectAndGenerateHint(userId, sensorId, config, userData);
	if (!hint) {
		return false;
	}

	await createHint({
		userId,
		forDate: today,
		hintType: hint.hintType,
		hintStage: hint.hintStage,
		hintText: hint.hintText,
		linkTarget: hint.linkTarget,
	});

	return true;
}

/**
 * Check if sensor has minimum days of data
 */
async function checkMinimumData(sensorId: string, minDays: number): Promise<boolean> {
	const end = new Date();
	const start = subDays(end, minDays);

	const data = await getEnergyForSensorInRange(start.toISOString(), end.toISOString(), sensorId, "day", "sum");

	return data.length >= minDays;
}

/**
 * Check and advance stage if user has seen enough hints
 */
async function checkAndAdvanceStage(userId: string, config: HintConfig): Promise<HintConfig> {
	if (config.hintsDaysSeenInStage >= HINTS_DAYS_TO_ADVANCE) {
		const nextStage = getNextStage(config.stage);
		if (nextStage) {
			await updateHintConfig(userId, {
				stage: nextStage,
				stageStartedAt: new Date(),
				hintsDaysSeenInStage: 0,
			});
			return {
				...config,
				stage: nextStage,
				stageStartedAt: new Date(),
				hintsDaysSeenInStage: 0,
			};
		}
	}
	return config;
}

/**
 * Get user pricing data
 */
async function getUserPricingData(userId: string) {
	const results = await db.select().from(userDataTable).where(eq(userDataTable.userId, userId)).limit(1);

	return results[0] || null;
}

/**
 * Select and generate the next hint
 */
async function selectAndGenerateHint(
	userId: string,
	sensorId: string,
	config: HintConfig,
	userData: { workingPrice: number | null; basePrice: number | null; consumptionGoal: number | null } | null,
): Promise<GeneratedHint | null> {
	const availableHints = getAvailableHintsForStage(config.stage);

	const recentHints = await getRecentHints(userId, 30);
	const clickedTypes = new Set(recentHints.filter((h) => h.clicked).map((h) => h.hintType));
	const recentlyShownTypes = recentHints.map((h) => h.hintType);

	const sortedHints = [...availableHints].sort((a, b) => {
		const aClicked = clickedTypes.has(a);
		const bClicked = clickedTypes.has(b);
		if (aClicked !== bClicked) return aClicked ? 1 : -1;

		const aIndex = recentlyShownTypes.indexOf(a);
		const bIndex = recentlyShownTypes.indexOf(b);
		if (aIndex === -1 && bIndex === -1) return 0;
		if (aIndex === -1) return -1;
		if (bIndex === -1) return 1;
		return bIndex - aIndex;
	});

	for (const hintType of sortedHints) {
		const hint = await tryGenerateHint(hintType, sensorId, config.stage, userData);
		if (hint) {
			return hint;
		}
	}

	return null;
}

/**
 * Try to generate a specific hint type
 */
async function tryGenerateHint(
	hintType: HintTypeValue,
	sensorId: string,
	stage: HintStage,
	userData: { workingPrice: number | null; basePrice: number | null; consumptionGoal: number | null } | null,
): Promise<GeneratedHint | null> {
	const data = await fetchHintData(hintType, sensorId, userData);
	if (!data) {
		return null;
	}

	let actualStage = stage;
	if (!STAGE_HINTS[stage].includes(hintType)) {
		for (const [s, hints] of Object.entries(STAGE_HINTS)) {
			if (hints.includes(hintType)) {
				actualStage = s as HintStage;
				break;
			}
		}
	}

	const hintText = formatHintText(hintType, data);
	const linkTarget = HINT_LINK_TARGETS[hintType];

	return {
		hintType,
		hintStage: actualStage,
		hintText,
		linkTarget,
	};
}

/**
 * Fetch data needed for a specific hint type
 */
async function fetchHintData(
	hintType: HintTypeValue,
	sensorId: string,
	userData: { workingPrice: number | null; basePrice: number | null; consumptionGoal: number | null } | null,
): Promise<HintData | null> {
	const now = new Date();
	const yesterday = subDays(startOfDay(now), 1);
	const yesterdayEnd = endOfDay(yesterday);
	const dayBeforeYesterday = subDays(yesterday, 1);

	switch (hintType) {
		case HintType.SIMPLE_TOTAL_CONSUMPTION: {
			const consumption = await getEnergySumForSensorInRange(yesterday, yesterdayEnd, sensorId);
			if (consumption <= 0) return null;
			return { consumption };
		}

		case HintType.SIMPLE_CONSUMPTION_COST: {
			if (!userData?.workingPrice || !userData?.basePrice) return null;
			const consumption = await getEnergySumForSensorInRange(yesterday, yesterdayEnd, sensorId);
			if (consumption <= 0) return null;
			const dailyBaseCost = userData.basePrice / getDaysInMonth(yesterday);
			const cost = consumption * userData.workingPrice + dailyBaseCost;
			return { consumption, cost };
		}

		case HintType.SIMPLE_MONTH_PREDICTION: {
			if (!userData?.workingPrice || !userData?.basePrice) return null;
			const monthStart = startOfMonth(now);
			const consumption = await getEnergySumForSensorInRange(monthStart, now, sensorId);
			if (consumption <= 0) return null;

			const daysPassed = Math.max(1, differenceInDays(now, monthStart) + 1);
			const daysInMonth = getDaysInMonth(now);
			const projectedConsumption = (consumption / daysPassed) * daysInMonth;
			const cost = projectedConsumption * userData.workingPrice + userData.basePrice;
			return { cost };
		}

		case HintType.SIMPLE_LOWEST_HOUR:
		case HintType.SIMPLE_HIGHEST_HOUR: {
			const hourlyData = await getEnergyForSensorInRange(
				yesterday.toISOString(),
				yesterdayEnd.toISOString(),
				sensorId,
				"hour",
				"sum",
			);
			if (hourlyData.length === 0) return null;

			const sorted = [...hourlyData].sort((a, b) => a.consumption - b.consumption);
			const target = hintType === HintType.SIMPLE_LOWEST_HOUR ? sorted[0] : sorted[sorted.length - 1];
			const hour = target.timestamp.getHours();
			return { hour };
		}

		case HintType.SIMPLE_PERCENT_CHANGE:
		case HintType.SIMPLE_KWH_CHANGE: {
			const yesterdayConsumption = await getEnergySumForSensorInRange(yesterday, yesterdayEnd, sensorId);
			const dayBeforeEnd = endOfDay(dayBeforeYesterday);
			const dayBeforeConsumption = await getEnergySumForSensorInRange(dayBeforeYesterday, dayBeforeEnd, sensorId);

			if (yesterdayConsumption <= 0 || dayBeforeConsumption <= 0) return null;

			const diff = yesterdayConsumption - dayBeforeConsumption;
			const percentChange = Math.abs((diff / dayBeforeConsumption) * 100);
			const kwhChange = Math.abs(diff);

			const direction = diff >= 0 ? "mehr" : "weniger";
			const directionAlt = diff >= 0 ? "höher" : "niedriger";

			if (hintType === HintType.SIMPLE_PERCENT_CHANGE) {
				return { percent: percentChange, direction, directionAlt };
			}
			return { kwh: kwhChange, direction, directionAlt };
		}

		case HintType.INTERMEDIATE_PEAK_SPIKE:
		case HintType.INTERMEDIATE_PEAK_VS_AVG:
		case HintType.INTERMEDIATE_PEAK_VS_LOWEST: {
			const peaks = await db
				.select()
				.from(energyDataSequenceTable)
				.where(
					and(
						eq(energyDataSequenceTable.sensorId, sensorId),
						eq(energyDataSequenceTable.type, "peak"),
						between(energyDataSequenceTable.start, yesterday, yesterdayEnd),
					),
				)
				.orderBy(desc(energyDataSequenceTable.averagePeakPower))
				.limit(5);

			if (peaks.length === 0) return null;

			const peak = peaks[0];
			const peakHour = peak.start.getHours();

			if (hintType === HintType.INTERMEDIATE_PEAK_SPIKE) {
				return { hour: peakHour };
			}

			const hourlyData = await getEnergyForSensorInRange(
				yesterday.toISOString(),
				yesterdayEnd.toISOString(),
				sensorId,
				"hour",
				"sum",
			);
			if (hourlyData.length === 0) return null;

			const avgConsumption = hourlyData.reduce((sum, h) => sum + h.consumption, 0) / hourlyData.length;
			const peakHourData = hourlyData.find((h) => h.timestamp.getHours() === peakHour);
			if (!peakHourData) return null;

			if (hintType === HintType.INTERMEDIATE_PEAK_VS_AVG) {
				const percentAboveAvg = ((peakHourData.consumption - avgConsumption) / avgConsumption) * 100;
				if (percentAboveAvg <= 0) return null;
				return { hour: peakHour, percent: percentAboveAvg };
			}

			const sorted = [...hourlyData].sort((a, b) => a.consumption - b.consumption);
			const lowest = sorted[0];
			if (lowest.consumption <= 0) return null;
			const percentAboveLowest = ((peakHourData.consumption - lowest.consumption) / lowest.consumption) * 100;
			return { peakHour, lowestHour: lowest.timestamp.getHours(), percent: percentAboveLowest };
		}

		case HintType.INTERMEDIATE_WEEK_COMPARISON: {
			const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
			const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
			const prevWeekStart = startOfWeek(subWeeks(now, 2), { weekStartsOn: 1 });
			const prevWeekEnd = endOfWeek(subWeeks(now, 2), { weekStartsOn: 1 });

			const lastWeekData = await getEnergyForSensorInRange(
				lastWeekStart.toISOString(),
				lastWeekEnd.toISOString(),
				sensorId,
				"day",
				"sum",
			);
			const prevWeekData = await getEnergyForSensorInRange(
				prevWeekStart.toISOString(),
				prevWeekEnd.toISOString(),
				sensorId,
				"day",
				"sum",
			);

			if (lastWeekData.length < 7 || prevWeekData.length < 7) return null;

			const lastWeekTotal = lastWeekData.reduce((sum, d) => sum + d.consumption, 0);
			const prevWeekTotal = prevWeekData.reduce((sum, d) => sum + d.consumption, 0);

			if (prevWeekTotal <= 0) return null;

			const diff = lastWeekTotal - prevWeekTotal;
			const percentChange = Math.abs((diff / prevWeekTotal) * 100);
			const direction = diff >= 0 ? "mehr" : "weniger";
			const directionPrep = diff >= 0 ? "über" : "unter";

			return { percent: percentChange, direction, directionPrep };
		}

		case HintType.INTERMEDIATE_WEEKEND_VS_WEEKDAY: {
			const twoWeeksAgo = subWeeks(now, 2);
			const data = await getEnergyForSensorInRange(
				twoWeeksAgo.toISOString(),
				now.toISOString(),
				sensorId,
				"day",
				"sum",
			);

			if (data.length < 10) return null;

			const weekdayData = data.filter((d) => {
				const day = d.timestamp.getDay();
				return day >= 1 && day <= 5;
			});
			const weekendData = data.filter((d) => {
				const day = d.timestamp.getDay();
				return day === 0 || day === 6;
			});

			if (weekdayData.length === 0 || weekendData.length === 0) return null;

			const weekdayAvg = weekdayData.reduce((sum, d) => sum + d.consumption, 0) / weekdayData.length;
			const weekendAvg = weekendData.reduce((sum, d) => sum + d.consumption, 0) / weekendData.length;

			if (weekdayAvg <= 0) return null;

			const diff = weekendAvg - weekdayAvg;
			const percentDiff = Math.abs((diff / weekdayAvg) * 100);
			const direction = diff >= 0 ? "höher" : "niedriger";

			return { percent: percentDiff, direction };
		}

		case HintType.EXPERT_HIGH_USE_PERIOD:
		case HintType.EXPERT_PERIOD_PERCENTAGE:
		case HintType.EXPERT_PERIOD_VS_AVG: {
			const hourlyData = await getEnergyForSensorInRange(
				yesterday.toISOString(),
				yesterdayEnd.toISOString(),
				sensorId,
				"hour",
				"sum",
			);
			if (hourlyData.length < 6) return null;

			const hourlyByHour = new Map<number, number>();
			for (const h of hourlyData) {
				hourlyByHour.set(h.timestamp.getHours(), h.consumption);
			}

			const completeHourlyData: { hour: number; consumption: number }[] = [];
			for (let hour = 0; hour < 24; hour++) {
				completeHourlyData.push({
					hour,
					consumption: hourlyByHour.get(hour) ?? 0,
				});
			}

			const totalConsumption = completeHourlyData.reduce((sum, h) => sum + h.consumption, 0);
			const avgConsumption = totalConsumption / 24;

			if (totalConsumption <= 0) return null;

			let maxPeriodConsumption = 0;
			let bestStartHour = 0;
			for (let i = 0; i < 24; i++) {
				const periodConsumption =
					completeHourlyData[i].consumption +
					completeHourlyData[(i + 1) % 24].consumption +
					completeHourlyData[(i + 2) % 24].consumption;
				if (periodConsumption > maxPeriodConsumption) {
					maxPeriodConsumption = periodConsumption;
					bestStartHour = i;
				}
			}

			if (maxPeriodConsumption <= 0) return null;

			const startHour = bestStartHour;
			const endHour = (bestStartHour + 3) % 24;

			if (hintType === HintType.EXPERT_HIGH_USE_PERIOD) {
				return { startHour, endHour, consumption: maxPeriodConsumption };
			}

			if (hintType === HintType.EXPERT_PERIOD_PERCENTAGE) {
				const percent = (maxPeriodConsumption / totalConsumption) * 100;
				return { startHour, endHour, percent };
			}

			const periodAvg = maxPeriodConsumption / 3;
			const percentAboveAvg = ((periodAvg - avgConsumption) / avgConsumption) * 100;
			if (percentAboveAvg <= 0) return null;
			return { startHour, endHour, percent: percentAboveAvg };
		}

		case HintType.EXPERT_DEVICE_USAGE: {
			const devicePeaks = await db
				.select({
					deviceId: deviceToPeakTable.deviceId,
					deviceName: deviceTable.name,
					peakPower: energyDataSequenceTable.averagePeakPower,
					peakStart: energyDataSequenceTable.start,
					peakEnd: energyDataSequenceTable.end,
				})
				.from(deviceToPeakTable)
				.innerJoin(
					energyDataSequenceTable,
					eq(energyDataSequenceTable.id, deviceToPeakTable.energyDataSequenceId),
				)
				.innerJoin(deviceTable, eq(deviceTable.id, deviceToPeakTable.deviceId))
				.where(
					and(
						eq(energyDataSequenceTable.sensorId, sensorId),
						between(energyDataSequenceTable.start, yesterday, yesterdayEnd),
					),
				);

			if (devicePeaks.length === 0) return null;

			const deviceConsumption = new Map<string, { name: string; consumption: number }>();
			for (const dp of devicePeaks) {
				const existing = deviceConsumption.get(dp.deviceId);
				const durationMs = dp.peakEnd.getTime() - dp.peakStart.getTime();
				const durationHours = Math.max(durationMs / (1000 * 60 * 60), 0.01);
				const estimatedKwh = dp.peakPower * durationHours;
				if (existing) {
					existing.consumption += estimatedKwh;
				} else {
					deviceConsumption.set(dp.deviceId, { name: dp.deviceName, consumption: estimatedKwh });
				}
			}

			const totalConsumption = await getEnergySumForSensorInRange(yesterday, yesterdayEnd, sensorId);
			if (totalConsumption <= 0) return null;

			let topDevice = { name: "", consumption: 0 };
			for (const [_, data] of deviceConsumption) {
				if (data.consumption > topDevice.consumption) {
					topDevice = data;
				}
			}

			if (topDevice.consumption <= 0) return null;

			const percent = (topDevice.consumption / totalConsumption) * 100;
			return { device: topDevice.name, consumption: topDevice.consumption, percent };
		}

		default:
			return null;
	}
}
