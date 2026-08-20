import { endOfDay, format, startOfDay, subDays } from "date-fns";
import { de } from "date-fns/locale";
import { HistoryIcon } from "lucide-react";
import SolarHistoryChart, { type SolarHistoryPoint } from "@/components/charts/energy/solar-history-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentSession } from "@/server/lib/auth";
import { getEnergyForSensorInRange, hasSolarInputForSensor } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { getSimulationSolarSettings, isSolarSimulationValid } from "@/server/queries/simulations";

interface Props {
	end: Date;
	className?: string;
}

export function SolarHistoryCardSkeleton({ className }: Pick<Props, "className">) {
	return (
		<Card className={className}>
			<CardHeader>
				<Skeleton className="h-5 w-36" />
				<Skeleton className="h-4 w-64 max-w-full" />
			</CardHeader>
			<CardContent className="space-y-5">
				<Skeleton className="h-12 w-48" />
				<Skeleton className="h-56 w-full" />
			</CardContent>
		</Card>
	);
}

export default async function SolarHistoryCard({ end, className }: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const [settings, sensorId] = await Promise.all([
		getSimulationSolarSettings(user.id),
		getEnergySensorIdForUser(user.id),
	]);
	if (!isSolarSimulationValid(settings) || !sensorId || !(await hasSolarInputForSensor(sensorId))) {
		return null;
	}

	const rangeEnd = endOfDay(end);
	const rangeStart = startOfDay(subDays(end, 13));
	const rows = await getEnergyForSensorInRange(
		rangeStart.toISOString(),
		rangeEnd.toISOString(),
		sensorId,
		"day",
		"sum",
	);
	if (rows.length === 0) {
		return null;
	}

	const data: SolarHistoryPoint[] = rows.map((row) => ({
		date: format(row.timestamp, "dd.MM.", { locale: de }),
		production: Number((row.inserted ?? 0).toFixed(3)),
	}));
	const total = data.reduce((sum, point) => sum + point.production, 0);
	const average = total / data.length;
	const bestDay = data.reduce((best, point) => (point.production > best.production ? point : best), data[0]);

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<HistoryIcon className="size-4 text-chart-4" />
					Solarhistorie
				</CardTitle>
				<CardDescription>Gemessene Einspeisung der letzten 14 Tage bis zum ausgewählten Datum.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-5">
				<div className="flex flex-wrap gap-x-8 gap-y-3">
					<div>
						<p className="text-muted-foreground text-xs">Ø pro Tag</p>
						<p className="font-mono font-semibold tabular-nums">{average.toFixed(2)} kWh</p>
					</div>
					<div>
						<p className="text-muted-foreground text-xs">Bester Tag ({bestDay.date})</p>
						<p className="font-mono font-semibold tabular-nums">{bestDay.production.toFixed(2)} kWh</p>
					</div>
				</div>
				<SolarHistoryChart data={data} />
			</CardContent>
		</Card>
	);
}
