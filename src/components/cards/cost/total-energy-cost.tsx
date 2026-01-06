import { differenceInDays, endOfDay, format, getDaysInMonth, isSameDay, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowDownIcon, ArrowUpIcon, DollarSignIcon, Settings2Icon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { cn } from "@/lib/utils";
import type { EnergyData } from "@/server/db/tables/sensor";
import { getCurrentSession } from "@/server/lib/auth";
import {
	calculateSpotPriceCost,
	calculateTouTariffCost,
	type SpotPriceConfig,
	type TouTariffConfig,
} from "@/server/lib/simulation/cost";
import { runSimulationsWithWarmup, type SimulationFilters } from "@/server/lib/simulation/run";
import { getEnergyForSensorInRange } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { getEnabledSimulations } from "@/server/queries/simulations";
import { buildSpotPriceMap, getSpotPricesForRange } from "@/server/queries/spot-prices";
import { getUserData } from "@/server/queries/user";

interface Props {
	start?: Date;
	end?: Date;
	compareStart?: Date;
	compareEnd?: Date;
	className?: string;
	filters?: SimulationFilters;
	showSimulation?: boolean;
}

interface HeadProps {
	start: Date;
	end: Date;
}

function CardHead(props: HeadProps) {
	const sameDay = isSameDay(props.start, props.end);
	const today = isSameDay(new Date(), props.start);

	let text = `${format(props.start, "PPP", { locale: de })} - ${format(props.end, "PPP", { locale: de })}`;
	if (today) {
		text = "Ihre Kosten heute";
	} else if (sameDay) {
		text = format(props.start, "PPP", { locale: de });
	}
	return (
		<CardHeader>
			<div className="flex flex-row justify-between">
				<div className="flex flex-col gap-1">
					<CardTitle className="flex items-center gap-1">
						<DollarSignIcon className="size-4" />
						Kosten
					</CardTitle>
					<CardDescription>{text}</CardDescription>
				</div>
				<Link className={buttonVariants({ variant: "ghost", size: "icon" })} href="/settings">
					<Settings2Icon className="size-4" />
				</Link>
			</div>
		</CardHeader>
	);
}

export default async function TotalEnergyCostCard(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}
	const userData = await getUserData(user.id);
	if (!userData) {
		return null;
	}

	const start = startOfDay(props.start || new Date());
	const end = endOfDay(props.end || start);

	if (!userData.workingPrice || !userData.basePrice) {
		return (
			<Card className={props.className}>
				<CardHead start={start} end={end} />
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

	const energySensorId = await getEnergySensorIdForUser(user.id);
	if (!energySensorId) {
		return (
			<Card className={props.className}>
				<CardHead start={start} end={end} />
				<CardContent>
					<p className="text-center font-mono font-semibold">Derzeit ist kein Sensor bei Ihnen aktiviert.</p>
				</CardContent>
			</Card>
		);
	}

	const data = await getEnergyForSensorInRange(start.toISOString(), end.toISOString(), energySensorId, "day", "sum");
	let compareData: EnergyData[] | null = null;
	if (props.compareStart) {
		const compareStart = startOfDay(props.compareStart || new Date());
		const compareEnd = endOfDay(props.compareEnd || start);
		compareData = await getEnergyForSensorInRange(
			compareStart.toISOString(),
			compareEnd.toISOString(),
			energySensorId,
			"day",
			"sum",
		);
	}
	if (!data || data.length === 0) {
		return (
			<Card className={props.className}>
				<CardHead start={start} end={end} />
				<CardContent>
					<p className="text-center font-mono font-semibold">Derzeit stehen keine Daten zur Verfügung.</p>
				</CardContent>
			</Card>
		);
	}

	const daysInMonth = getDaysInMonth(start);
	const dayDiff = differenceInDays(end, start) + 1;

	const consumption = data.reduce((acc, curr) => curr.consumption + acc, 0);
	const workingCost = consumption * userData.workingPrice;
	const baseCost = (userData.basePrice / daysInMonth) * dayDiff;
	const cost = workingCost + baseCost;

	let originalTouCost: number | null = null;
	let originalSpotCost: number | null = null;
	let simCostOriginalTariff: number | null = null;
	let simCostTouTariff: number | null = null;
	let simCostSpotTariff: number | null = null;

	if (props.showSimulation) {
		const enabledSimulations = await getEnabledSimulations(user.id);
		const hasActiveSimulations =
			enabledSimulations.ev ||
			enabledSimulations.solar ||
			enabledSimulations.heatpump ||
			enabledSimulations.battery;

		const pricingMode = enabledSimulations.tou?.pricingMode ?? "tou";
		const isSpotMode = pricingMode === "spot";

		const showTariff = props.filters
			? props.filters.tou !== false && enabledSimulations.tou !== null
			: enabledSimulations.tou !== null;

		if (showTariff || hasActiveSimulations) {
			const hourlyData = await getEnergyForSensorInRange(
				start.toISOString(),
				end.toISOString(),
				energySensorId,
				"hour",
				"sum",
			);

			if (hourlyData && hourlyData.length > 0) {
				const touConfig: TouTariffConfig | null =
					showTariff && enabledSimulations.tou && !isSpotMode
						? {
								basePrice: enabledSimulations.tou.basePrice,
								standardPrice: enabledSimulations.tou.standardPrice,
								zones: enabledSimulations.tou.zones,
								weekdayZones: enabledSimulations.tou.weekdayZones,
							}
						: null;

				const spotConfig: SpotPriceConfig | null =
					showTariff && enabledSimulations.tou && isSpotMode
						? {
								basePrice: enabledSimulations.tou.basePrice,
								markup: enabledSimulations.tou.spotMarkup ?? 3,
							}
						: null;

				let spotPriceMap: Map<number, number> | null = null;
				if (spotConfig) {
					const spotPrices = await getSpotPricesForRange(start, end);
					const tz = TimezoneTypeToTimeZone[user.timezone ?? TimeZoneType.Europe_Berlin];
					spotPriceMap = buildSpotPriceMap(spotPrices, tz);
				}

				if (touConfig) {
					const touResult = calculateTouTariffCost(hourlyData, touConfig, dayDiff, daysInMonth);
					originalTouCost = touResult.totalCost;
				}

				if (spotConfig && spotPriceMap) {
					const spotResult = calculateSpotPriceCost(
						hourlyData,
						spotPriceMap,
						spotConfig,
						dayDiff,
						daysInMonth,
					);
					originalSpotCost = spotResult.totalCost;
				}

				if (hasActiveSimulations) {
					const simData = await runSimulationsWithWarmup(
						hourlyData,
						user.id,
						{
							aggregation: "hour",
							sensorId: energySensorId,
							startDate: start,
						},
						props.filters,
					);
					const simConsumption = simData.reduce((acc, curr) => curr.consumption + acc, 0);

					const simWorkingCost = simConsumption * userData.workingPrice;
					simCostOriginalTariff = simWorkingCost + baseCost;

					if (touConfig) {
						const simTouResult = calculateTouTariffCost(simData, touConfig, dayDiff, daysInMonth);
						simCostTouTariff = simTouResult.totalCost;
					}

					if (spotConfig && spotPriceMap) {
						const simSpotResult = calculateSpotPriceCost(
							simData,
							spotPriceMap,
							spotConfig,
							dayDiff,
							daysInMonth,
						);
						simCostSpotTariff = simSpotResult.totalCost;
					}
				}
			}
		}
	}

	let compareCost: number | null = null;
	let diff: number | null = null;
	if (compareData) {
		const compareConsumption = compareData[0].consumption;
		const compareWorkingCost = compareConsumption * userData.workingPrice;
		compareCost = compareWorkingCost + baseCost;
		diff = Number((cost / compareCost).toFixed(2));
	}
	return (
		<Card className={props.className}>
			<CardHead start={start} end={end} />
			<CardContent>
				<p className="font-mono font-semibold">{cost.toFixed(2)} €</p>
				{originalTouCost !== null ? (
					<p className="mt-2 font-mono text-sm text-muted-foreground">
						Mit Zeittarif: {originalTouCost.toFixed(2)} €
					</p>
				) : null}
				{originalSpotCost !== null ? (
					<p className="mt-2 font-mono text-sm text-muted-foreground">
						Mit Börsenpreis: {originalSpotCost.toFixed(2)} €
					</p>
				) : null}
				{simCostOriginalTariff !== null ? (
					<p className="mt-2 font-mono text-sm text-muted-foreground">
						Mit Simulation: {simCostOriginalTariff.toFixed(2)} €
					</p>
				) : null}
				{simCostTouTariff !== null ? (
					<p className="mt-2 font-mono text-sm text-muted-foreground">
						Simulation + Zeittarif: {simCostTouTariff.toFixed(2)} €
					</p>
				) : null}
				{simCostSpotTariff !== null ? (
					<p className="mt-2 font-mono text-sm text-muted-foreground">
						Simulation + Börsenpreis: {simCostSpotTariff.toFixed(2)} €
					</p>
				) : null}
				{compareCost && diff ? (
					<p
						className={cn(
							{
								"text-primary": diff < 1,
								"text-destructive": diff > 1,
								"text-foreground": diff === 1,
							},
							"mt-4 flex flex-row items-center text-xs",
						)}
					>
						{diff === 1 ? (
							<>ca. gleiche Kosten {compareCost.toFixed(2)} €</>
						) : (
							<>
								{diff < 1 ? (
									<ArrowDownIcon className="mr-1 size-3" />
								) : (
									<ArrowUpIcon className="mr-1 size-3" />
								)}
								{(diff < 1 ? 100 - diff * 100 : diff * 100 - 100).toFixed(0)} %{" "}
								{diff >= 1 ? "mehr Kosten" : "weniger Kosten"}: {compareCost.toFixed(2)} €
							</>
						)}
					</p>
				) : null}
			</CardContent>
		</Card>
	);
}
