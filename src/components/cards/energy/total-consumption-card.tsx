import { endOfDay, format, isSameDay, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowDownIcon, ArrowUpIcon, ZapIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EnergyData } from "@/server/db/tables/sensor";
import { getCurrentSession } from "@/server/lib/auth";
import { getUserData } from "@/server/queries/user";
import { runSimulationsWithWarmup, type SimulationFilters } from "@/server/lib/simulation/run";
import { getEnergyForSensorInRange } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { getEnabledSimulations } from "@/server/queries/simulations";

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
		text = "Ihr Netzbezug heute";
	} else if (sameDay) {
		text = format(props.start, "PPP", { locale: de });
	}

	return (
		<CardHeader>
			<CardTitle className="flex items-center gap-1">
				<ZapIcon className="size-4" />
				Energieübersicht
			</CardTitle>
			<CardDescription>{text}</CardDescription>
		</CardHeader>
	);
}

export default async function TotalEnergyConsumptionCard(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const [userData, energySensorId] = await Promise.all([
		getUserData(user.id),
		getEnergySensorIdForUser(user.id),
	]);

	const start = startOfDay(props.start || new Date());
	const end = endOfDay(props.end || start);

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

	const data = await getEnergyForSensorInRange(start.toISOString(), end.toISOString(), energySensorId, "hour", "sum");
	let compareData: EnergyData[] | null = null;
	if (props.compareStart) {
		const compareStart = startOfDay(props.compareStart || new Date());
		const compareEnd = endOfDay(props.compareEnd || start);
		compareData = await getEnergyForSensorInRange(
			compareStart.toISOString(),
			compareEnd.toISOString(),
			energySensorId,
			"hour",
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

	let simValueIn: number | null = null;
	let simValueOut: number | null = null;
	if (props.showSimulation) {
		const enabledSimulations = await getEnabledSimulations(user.id);
		const hasActiveSimulations =
			enabledSimulations.ev ||
			enabledSimulations.solar ||
			enabledSimulations.heatpump ||
			enabledSimulations.battery;

		if (hasActiveSimulations) {
			const simData = await runSimulationsWithWarmup(
				data,
				user.id,
				{
					aggregation: "hour",
					sensorId: energySensorId,
					startDate: start,
				},
				props.filters,
			);

			simValueIn = simData.reduce((acc, curr) => curr.consumption + acc, 0);
			simValueOut = simData.reduce((acc, curr) => acc + (curr.inserted ?? 0), 0);
		}
	}

	const value = data.reduce((acc, curr) => acc + curr.consumption, 0);
							//const inserted = data.reduce((acc, curr) => acc + (curr.inserted ?? 0), 0);
	const showSolarFeedIn = userData?.showSolarFeedIn ?? false;
	const feedInValue = showSolarFeedIn
		? data.reduce((acc, curr) => acc + (curr.inserted ?? 0), 0)
		: null;

	let compareValue: number | null = null;
	let diff: number | null = null;
	if (compareData) {
		// Sum up hourly data for comparison
		const compareValueSum = compareData.reduce((acc, curr) => acc + curr.consumption, 0);
		compareValue = compareValueSum;
		diff = Number((value / compareValue).toFixed(2));
	}
	return (
		<Card className={props.className}>
			<CardHead start={start} end={end} />
			<CardContent>
				<p className="font-mono font-semibold">{value.toFixed(2)} kWh Bezug</p>
				{(feedInValue !== null) ? (
					<p className="mt-1 font-mono text-sm text-muted-foreground">
						Einspeisung: {feedInValue.toFixed(2)} kWh
					</p>
				) : null}
				{simValueIn !== null ? (
					<p className="mt-2 font-mono text-sm text-muted-foreground">
						Netzbezug mit Simulation: {simValueIn.toFixed(2)} kWh
					</p>
				) : null}
				{simValueOut !== null && simValueOut != 0 ? (
					<p className="mt-2 font-mono text-sm text-muted-foreground">
						Einspeisung mit Simulation: {simValueOut.toFixed(2)} kWh
					</p>
				) : null}
				{compareValue && diff ? (
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
							<>ca. gleicher Bezug: {compareValue.toFixed(2)} kWh</>
						) : (
							<>
								{diff < 1 ? (
									<ArrowDownIcon className="mr-1 size-3" />
								) : (
									<ArrowUpIcon className="mr-1 size-3" />
								)}
								{(diff < 1 ? 100 - diff * 100 : diff * 100 - 100).toFixed(0)} %{" "}
								{diff > 1 ? "mehr Bezug" : diff < 1 ? "weniger Bezug" : "gleicher Bezug"}:{" "}
								{compareValue.toFixed(2)} kWh
							</>
						)}
					</p>
				) : null}
			</CardContent>
		</Card>
	);
}