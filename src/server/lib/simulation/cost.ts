import type { TouTariffZone, TouWeekdayZones } from "@/server/db/tables/simulation";
import type { EnergyPoint, EnergySeries } from "./types";

export interface TouTariffConfig {
	basePrice: number;
	standardPrice: number;
	zones: TouTariffZone[];
	weekdayZones: TouWeekdayZones;
}

export interface CostResult {
	totalCost: number;
	workingCost: number;
	baseCost: number;
	totalConsumption: number;
	averagePrice: number;
	zoneBreakdown?: ZoneCostBreakdown[];
}

export interface ZoneCostBreakdown {
	zone: string;
	price: number;
	consumption: number;
	cost: number;
}

type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

function getWeekday(date: Date): Weekday {
	const days: Weekday[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
	return days[date.getDay()] as Weekday;
}

function parseTimeToMinutes(time: string): number {
	const [hours, minutes] = time.split(":").map(Number);
	return hours * 60 + minutes;
}

function isTimeInZone(timeMinutes: number, zone: TouTariffZone): boolean {
	const start = parseTimeToMinutes(zone.start);
	const end = parseTimeToMinutes(zone.end);

	if (start <= end) {
		return timeMinutes >= start && timeMinutes < end;
	}
	return timeMinutes >= start || timeMinutes < end;
}

function getPriceForTimestamp(timestamp: Date, config: TouTariffConfig): { price: number; zone: string | null } {
	const weekday = getWeekday(timestamp);
	const timeMinutes = timestamp.getHours() * 60 + timestamp.getMinutes();

	const weekdayZones = config.weekdayZones[weekday];
	const zones = weekdayZones && weekdayZones.length > 0 ? weekdayZones : config.zones;

	for (const zone of zones) {
		if (isTimeInZone(timeMinutes, zone)) {
			return {
				price: zone.price,
				zone: `${zone.start}-${zone.end}`,
			};
		}
	}

	return {
		price: config.standardPrice,
		zone: null,
	};
}

export function calculateTouTariffCost(
	data: EnergySeries,
	config: TouTariffConfig,
	days: number,
	daysInMonth: number = 30,
): CostResult {
	if (data.length === 0) {
		return {
			totalCost: 0,
			workingCost: 0,
			baseCost: 0,
			totalConsumption: 0,
			averagePrice: config.standardPrice,
			zoneBreakdown: [],
		};
	}

	const zoneMap = new Map<string, { price: number; consumption: number; cost: number }>();
	let totalConsumption = 0;
	let workingCost = 0;

	for (const point of data) {
		const { price, zone } = getPriceForTimestamp(point.timestamp, config);
		const consumption = point.consumption;
		const costCents = consumption * price;

		totalConsumption += consumption;
		workingCost += costCents;

		const zoneKey = zone ?? `Standard (${config.standardPrice}ct)`;
		const existing = zoneMap.get(zoneKey) ?? { price, consumption: 0, cost: 0 };
		existing.consumption += consumption;
		existing.cost += costCents;
		zoneMap.set(zoneKey, existing);
	}

	const workingCostEuro = workingCost / 100;

	const baseCost = (config.basePrice / daysInMonth) * days;

	const zoneBreakdown: ZoneCostBreakdown[] = Array.from(zoneMap.entries()).map(([zone, data]) => ({
		zone,
		price: data.price,
		consumption: data.consumption,
		cost: data.cost / 100,
	}));

	zoneBreakdown.sort((a, b) => b.consumption - a.consumption);

	const totalCost = workingCostEuro + baseCost;
	const averagePrice = totalConsumption > 0 ? workingCost / totalConsumption : config.standardPrice;

	return {
		totalCost,
		workingCost: workingCostEuro,
		baseCost,
		totalConsumption,
		averagePrice,
		zoneBreakdown,
	};
}

export function calculatePointCostTou(point: EnergyPoint, config: TouTariffConfig): number {
	const { price } = getPriceForTimestamp(point.timestamp, config);
	return (point.consumption * price) / 100;
}

export function compareCosts(
	originalCost: CostResult,
	simulatedCost: CostResult,
): {
	absoluteSavings: number;
	percentageSavings: number;
	consumptionDifference: number;
	isCheaper: boolean;
} {
	const absoluteSavings = originalCost.totalCost - simulatedCost.totalCost;
	const percentageSavings = originalCost.totalCost > 0 ? (absoluteSavings / originalCost.totalCost) * 100 : 0;
	const consumptionDifference = originalCost.totalConsumption - simulatedCost.totalConsumption;

	return {
		absoluteSavings,
		percentageSavings,
		consumptionDifference,
		isCheaper: absoluteSavings > 0,
	};
}

export function calculateFeedInRevenue(data: EnergySeries, feedInTariff: number): number {
	const totalFeedIn = data.reduce((sum, point) => sum + (point.valueOut ?? 0), 0);
	return (totalFeedIn * feedInTariff) / 100;
}

export function calculateNetCost(consumptionCost: CostResult, feedInRevenue: number): number {
	return consumptionCost.totalCost - feedInRevenue;
}
