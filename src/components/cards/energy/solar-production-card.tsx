import { endOfDay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import Link from "next/link";
import EnergyBarChart from "@/components/charts/energy/bar-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import type { EnergyData } from "@/server/db/tables/sensor";
import { getCurrentSession } from "@/server/lib/auth";
import { getEnergyForSensorInRange, hasSolarInputForSensor } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { getSimulationSolarSettings, isSolarSimulationValid } from "@/server/queries/simulations";

interface Props {
	start: Date;
	end?: Date;
	compareStart?: Date;
	compareEnd?: Date;
	type: "day" | "week" | "month";
	className?: string;
}

function getDescription(type: Props["type"]) {
	if (type === "week") {
		return "Detailansicht nach Wochentagen.";
	}

	if (type === "month") {
		return "Detailansicht nach Wochen.";
	}

	return "Ihre Einspeisung aggregiert in Stunden.";
}

function SolarProductionCardHeader({ type }: Pick<Props, "type">) {
	return (
		<CardHeader>
			<CardTitle>Solareinspeisung</CardTitle>
			<CardDescription>{getDescription(type)}</CardDescription>
		</CardHeader>
	);
}

export function SolarProductionCardSkeleton({ className }: Pick<Props, "className">) {
	return (
		<Card className={className}>
			<CardHeader>
				<Skeleton className="h-5 w-40" />
				<Skeleton className="h-4 w-72 max-w-full" />
			</CardHeader>
			<CardContent className="space-y-6">
				<Skeleton className="h-56 w-full" />
			</CardContent>
		</Card>
	);
}

export default async function SolarProductionCard(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const solarSettings = await getSimulationSolarSettings(user.id);
	if (!isSolarSimulationValid(solarSettings)) {
		return (
			<Card className={props.className}>
				<CardHeader>
					<CardTitle>Photovoltaik einrichten</CardTitle>
					<CardDescription>
						Hinterlegen Sie zuerst die Daten Ihrer Solaranlage, um die Einspeisung auszuwerten.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild>
						<Link href="/settings/solar">Zu den Photovoltaik-Einstellungen</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	const sensorId = await getEnergySensorIdForUser(user.id);
	if (!sensorId) {
		return (
			<Card className={props.className}>
				<SolarProductionCardHeader type={props.type} />
				<CardContent>
					<p className="text-center font-mono font-semibold">Derzeit ist kein Sensor bei Ihnen aktiviert.</p>
				</CardContent>
			</Card>
		);
	}

	if (!(await hasSolarInputForSensor(sensorId))) {
		return (
			<Card className={props.className}>
				<SolarProductionCardHeader type={props.type} />
				<CardContent>
					<p className="text-center font-mono font-semibold">
						Ihr Stromzähler hat bisher keine Einspeisedaten übermittelt.
					</p>
				</CardContent>
			</Card>
		);
	}

	const aggregation = props.type === "day" ? "hour" : props.type === "week" ? "weekday" : "week";
	const start = props.start;
	const end = endOfDay(props.end ?? start);
	const data = await getEnergyForSensorInRange(start.toISOString(), end.toISOString(), sensorId, aggregation, "sum");

	let compareData: typeof data | undefined;
	if (props.compareStart) {
		const compareEnd = endOfDay(props.compareEnd ?? props.compareStart);
		compareData = await getEnergyForSensorInRange(
			props.compareStart.toISOString(),
			compareEnd.toISOString(),
			sensorId,
			aggregation,
			"sum",
		);
	}

	const timezone = TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin];
	const toChartData = (rows: typeof data): EnergyData[] =>
		rows.map((row) => ({
			...row,
			timestamp: fromZonedTime(row.timestamp, timezone),
		}));

	const chartData = toChartData(data);
	const chartCompareData = compareData ? toChartData(compareData) : undefined;

	const chartConfig = {
		inserted: {
			label: "Einspeisung (kWh)",
			color: "var(--chart-4)",
		},
		insertedCompare: {
			label: "Vorperiode: Einspeisung (kWh)",
			color: "var(--chart-1)",
		},
	} satisfies ChartConfig;

	return (
		<Card className={props.className}>
			<SolarProductionCardHeader type={props.type} />
			<CardContent>
				{chartData.length > 0 ? (
					<EnergyBarChart
						data={chartData}
						compareData={chartCompareData}
						dateFormat={aggregation}
						display={["inserted"]}
						dataKey="inserted"
						config={chartConfig}
					/>
				) : (
					<p className="text-center font-mono font-semibold">
						Derzeit stehen keine Daten zur Verfügung.
					</p>
				)}
			</CardContent>
		</Card>
	);
}