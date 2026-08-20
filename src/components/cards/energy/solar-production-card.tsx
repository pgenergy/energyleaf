import { endOfDay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { SunIcon } from "lucide-react";
import Link from "next/link";
import SolarProductionChart, { type SolarProductionPoint } from "@/components/charts/energy/solar-production-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
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
		return "Ihre gemessene Solareinspeisung nach Wochentagen.";
	}

	if (type === "month") {
		return "Ihre gemessene Solareinspeisung nach Wochen.";
	}

	return "Ihre gemessene Solareinspeisung im Tagesverlauf.";
}

function SolarProductionCardHeader({ type }: Pick<Props, "type">) {
	return (
		<CardHeader>
			<CardTitle className="flex items-center gap-2">
				<SunIcon className="size-4 text-chart-4" />
				Solareinspeisung
			</CardTitle>
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
				<div className="space-y-2">
					<Skeleton className="h-8 w-32" />
					<Skeleton className="h-4 w-44" />
				</div>
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
					<CardTitle className="flex items-center gap-2">
						<SunIcon className="size-4 text-chart-4" />
						Photovoltaik einrichten
					</CardTitle>
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
					<p className="text-center text-muted-foreground">
						Ihre Solaranlage ist eingerichtet, aber der Stromzähler hat noch keine Einspeisedaten
						übermittelt.
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
	const toChartData = (rows: typeof data): SolarProductionPoint[] =>
		rows.map((row) => ({
			production: Number((row.inserted ?? 0).toFixed(3)),
			timestamp: fromZonedTime(row.timestamp, timezone),
		}));
	const chartData = toChartData(data);
	const chartCompareData = compareData ? toChartData(compareData) : undefined;
	const total = chartData.reduce((sum, point) => sum + point.production, 0);
	const compareTotal = chartCompareData?.reduce((sum, point) => sum + point.production, 0);

	return (
		<Card className={props.className}>
			<SolarProductionCardHeader type={props.type} />
			<CardContent className="space-y-6">
				<div>
					<p className="font-mono font-semibold text-2xl tabular-nums">{total.toFixed(2)} kWh</p>
					<p className="text-muted-foreground text-sm">im ausgewählten Zeitraum ins Netz eingespeist</p>
					{compareTotal !== undefined ? (
						<p className="mt-1 text-muted-foreground text-sm">
							Vergleich: <span className="font-mono tabular-nums">{compareTotal.toFixed(2)} kWh</span>
						</p>
					) : null}
				</div>

				{chartData.length > 0 ? (
					<SolarProductionChart data={chartData} compareData={chartCompareData} dateFormat={aggregation} />
				) : (
					<p className="py-16 text-center font-mono font-semibold text-muted-foreground">
						Für diesen Zeitraum stehen keine Messwerte zur Verfügung.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
