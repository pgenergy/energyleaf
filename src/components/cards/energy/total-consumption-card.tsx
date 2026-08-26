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

	let simValue: number | null = null;
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
					aggregation: "day",
					sensorId: energySensorId,
					startDate: start,
				},
				props.filters,
			);
			simValue = simData.reduce((acc, curr) => curr.consumption + acc, 0);
		}
	}

	const value = data.reduce((acc, curr) => curr.consumption + acc, 0);
	const showSolarFeedIn = userData?.showSolarFeedIn ?? false;
	const feedInValue = showSolarFeedIn
		? data.reduce((acc, curr) => acc + (curr.inserted ?? 0), 0)
		: null;

	let compareValue: number | null = null;
	let diff: number | null = null;
	if (compareData) {
		compareValue = compareData[0].consumption;
		diff = Number((value / compareValue).toFixed(2));
	}
	return (
		<Card className={props.className}>
			<CardHead start={start} end={end} />
			<CardContent>
				<p className="font-mono font-semibold">{value.toFixed(2)} kWh</p>
				{feedInValue !== null ? (
					<p className="mt-1 font-mono text-sm text-muted-foreground">
						Einspeisung: {feedInValue.toFixed(2)} kWh
					</p>
				) : null}
				{simValue !== null ? (
					<p className="mt-2 font-mono text-sm text-muted-foreground">
						Mit Simulation: {simValue.toFixed(2)} kWh
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