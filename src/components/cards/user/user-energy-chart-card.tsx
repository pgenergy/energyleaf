import { endOfDay, startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import DetailEnergyChart from "@/components/charts/energy/detail-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { getEnergyForSensorInRange } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";

interface Props {
	userId: string;
	timezone: TimeZoneType | null;
	className?: string;
}

export default async function UserEnergyChartCard(props: Props) {
	const tz = TimezoneTypeToTimeZone[props.timezone || TimeZoneType.Europe_Berlin];
	const baseDate = toZonedTime(new Date(), tz);
	const start = startOfDay(baseDate);
	const end = endOfDay(baseDate);

	const energySensorId = await getEnergySensorIdForUser(props.userId);
	if (!energySensorId) {
		return null;
	}

	const data = await getEnergyForSensorInRange(start.toISOString(), end.toISOString(), energySensorId);
	if (data.length === 0) {
		return (
			<Card className={props.className}>
				<CardHeader>
					<CardTitle>Energieverbrauch heute</CardTitle>
					<CardDescription>Energieverbrauch im Tagesverlauf.</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-center font-mono font-semibold">Derzeit stehen keine Daten zur Verfügung.</p>
				</CardContent>
			</Card>
		);
	}

	const chartConfig = {
		total: {
			label: "Energieverbrauch (kWh)",
			color: "var(--primary)",
		},
	} satisfies ChartConfig;

	return (
		<Card className={props.className}>
			<CardHeader>
				<CardTitle>Energieverbrauch heute</CardTitle>
				<CardDescription>Energieverbrauch im Tagesverlauf.</CardDescription>
			</CardHeader>
			<CardContent>
				<DetailEnergyChart
					data={data.map((d) => ({
						...d,
						timestamp: fromZonedTime(d.timestamp, tz),
					}))}
					config={chartConfig}
					display={["total"]}
					dataKey="total"
					dateFormat="hour"
				/>
			</CardContent>
		</Card>
	);
}
