import { endOfDay, getDaysInMonth, startOfDay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import Link from "next/link";
import SimulationCostBarChart, { type CostDataPoint } from "@/components/charts/cost/simulation-cost-bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import type { TouTariffZone } from "@/server/db/tables/simulation";
import type { SpotPriceConfig, TouTariffConfig } from "@/server/lib/simulation/cost";
import { runSimulationsWithWarmup, type SimulationFilters } from "@/server/lib/simulation/run";
import { getEnergyForSensorInRange } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { getEnabledSimulations } from "@/server/queries/simulations";
import { buildSpotPriceMap, getSpotPricesForRange } from "@/server/queries/spot-prices";
import { getUserData } from "@/server/queries/user";

interface Props {
	userId: string;
	timezone: TimeZoneType | null;
	start: Date;
	filters: SimulationFilters;
}

function parseTimeToMinutes(time: string): number {
	const parts = time.split(":");
	const hours = Number.parseInt(parts[0], 10);
	const minutes = Number.parseInt(parts[1], 10);
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

function getPriceForTimestamp(timestamp: Date, config: TouTariffConfig): number {
	const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
	const weekday = days[timestamp.getDay()];
	const timeMinutes = timestamp.getHours() * 60 + timestamp.getMinutes();

	const weekdayZones = config.weekdayZones[weekday];
	const zones = weekdayZones && weekdayZones.length > 0 ? weekdayZones : config.zones;

	for (const zone of zones) {
		if (isTimeInZone(timeMinutes, zone)) {
			return zone.price;
		}
	}

	return config.standardPrice;
}

function calculatePointTouCost(consumption: number, timestamp: Date, config: TouTariffConfig): number {
	const price = getPriceForTimestamp(timestamp, config);
	return (consumption * price) / 100;
}

function calculatePointSpotCost(
	consumption: number,
	timestamp: Date,
	spotPriceMap: Map<number, number>,
	markup: number,
): number {
	const ms = timestamp.getTime();
	const fifteenMinMs = 15 * 60 * 1000;
	const slotMs = Math.floor(ms / fifteenMinMs) * fifteenMinMs;

	const priceEurMwh = spotPriceMap.get(slotMs);
	const spotPriceCtKwh = priceEurMwh !== undefined ? priceEurMwh / 10 : 0;
	const totalPriceCtKwh = spotPriceCtKwh + markup;
	return (consumption * totalPriceCtKwh) / 100;
}

export default async function SimulationCostBarChartCard(props: Props) {
	const tz = TimezoneTypeToTimeZone[props.timezone || TimeZoneType.Europe_Berlin];
	const start = startOfDay(props.start);
	const end = endOfDay(props.start);

	const userData = await getUserData(props.userId);
	if (!userData) {
		return null;
	}

	if (!userData.workingPrice || !userData.basePrice) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Kostenübersicht</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-center font-mono font-semibold">
						Hinterlegen Sie in den{" "}
						<Link href="/settings" className="underline hover:no-underline">
							Einstellungen
						</Link>{" "}
						Ihren Tarif.
					</p>
				</CardContent>
			</Card>
		);
	}

	const energySensorId = await getEnergySensorIdForUser(props.userId);
	if (!energySensorId) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Kostenübersicht</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-center font-mono font-semibold">Derzeit ist kein Sensor bei Ihnen aktiviert.</p>
				</CardContent>
			</Card>
		);
	}

	const hourlyData = await getEnergyForSensorInRange(
		start.toISOString(),
		end.toISOString(),
		energySensorId,
		"hour",
		"sum",
	);

	if (hourlyData.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Kostenübersicht</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-center font-mono font-semibold">
						Für diesen Tag stehen keine Daten zur Verfügung.
					</p>
				</CardContent>
			</Card>
		);
	}

	const enabledSimulations = await getEnabledSimulations(props.userId);

	// Check if any simulation filters are active
	const hasActiveFilters = !!(
		(enabledSimulations.ev && props.filters.ev) ||
		(enabledSimulations.solar && props.filters.solar) ||
		(enabledSimulations.heatpump && props.filters.heatpump) ||
		(enabledSimulations.battery && props.filters.battery)
	);

	// Check pricing mode and if tariff is configured
	const pricingMode = enabledSimulations.tou?.pricingMode ?? "tou";
	const isSpotMode = pricingMode === "spot";
	const hasTariff = enabledSimulations.tou !== null;
	const tariffFilterEnabled = props.filters.tou !== false;
	const showAltTariff = hasTariff && tariffFilterEnabled;

	// Build TOU config if available and in TOU mode
	const touConfig: TouTariffConfig | null =
		showAltTariff && enabledSimulations.tou && !isSpotMode
			? {
					basePrice: enabledSimulations.tou.basePrice,
					standardPrice: enabledSimulations.tou.standardPrice,
					zones: enabledSimulations.tou.zones,
					weekdayZones: enabledSimulations.tou.weekdayZones,
				}
			: null;

	// Build spot config if available and in spot mode
	const spotConfig: SpotPriceConfig | null =
		showAltTariff && enabledSimulations.tou && isSpotMode
			? {
					basePrice: enabledSimulations.tou.basePrice,
					markup: enabledSimulations.tou.spotMarkup ?? 3,
				}
			: null;

	// Fetch spot prices if using spot mode
	let spotPriceMap: Map<number, number> | null = null;
	if (spotConfig) {
		const spotPrices = await getSpotPricesForRange(start, end);
		spotPriceMap = buildSpotPriceMap(spotPrices, tz);
	}

	// Calculate hourly base cost portion
	const daysInMonth = getDaysInMonth(start);
	const workingPrice = userData.workingPrice;
	const basePrice = userData.basePrice;
	const hourlyBaseCost = basePrice / daysInMonth / 24;
	const hourlyAltTariffBaseCost =
		showAltTariff && enabledSimulations.tou ? enabledSimulations.tou.basePrice / daysInMonth / 24 : 0;

	// Calculate costs for original data
	const originalCostData: CostDataPoint[] = hourlyData.map((d) => {
		const standardCost = d.consumption * workingPrice + hourlyBaseCost;

		let altTariffCost: number | undefined;
		if (touConfig) {
			altTariffCost = calculatePointTouCost(d.consumption, d.timestamp, touConfig) + hourlyAltTariffBaseCost;
		} else if (spotConfig && spotPriceMap) {
			altTariffCost =
				calculatePointSpotCost(d.consumption, d.timestamp, spotPriceMap, spotConfig.markup) +
				hourlyAltTariffBaseCost;
		}

		return {
			timestamp: fromZonedTime(d.timestamp, tz),
			standardCost,
			touCost: altTariffCost,
		};
	});

	// Calculate costs for simulation data
	let simCostData: CostDataPoint[];

	if (hasActiveFilters) {
		const hourlySimData = await runSimulationsWithWarmup(
			hourlyData,
			props.userId,
			{
				aggregation: "hour",
				sensorId: energySensorId,
				startDate: start,
			},
			props.filters,
		);

		simCostData = hourlySimData.map((d) => {
			const standardCost = d.consumption * workingPrice + hourlyBaseCost;

			let altTariffCost: number | undefined;
			if (touConfig) {
				altTariffCost = calculatePointTouCost(d.consumption, d.timestamp, touConfig) + hourlyAltTariffBaseCost;
			} else if (spotConfig && spotPriceMap) {
				altTariffCost =
					calculatePointSpotCost(d.consumption, d.timestamp, spotPriceMap, spotConfig.markup) +
					hourlyAltTariffBaseCost;
			}

			return {
				timestamp: fromZonedTime(d.timestamp, tz),
				standardCost,
				touCost: altTariffCost,
			};
		});
	} else {
		// No active simulations, use original data as sim data
		simCostData = originalCostData;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Kostenübersicht</CardTitle>
			</CardHeader>
			<CardContent>
				<SimulationCostBarChart
					originalData={originalCostData}
					simData={simCostData}
					showTou={showAltTariff}
					hasSimulation={hasActiveFilters}
				/>
			</CardContent>
		</Card>
	);
}
