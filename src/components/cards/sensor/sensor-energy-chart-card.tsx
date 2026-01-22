import { endOfDay, startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import DetailEnergyChart from "@/components/charts/energy/detail-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { SensorType, SensorTypeDisplay, type SensorTypeValue, TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { getEnergyForSensorInRange } from "@/server/queries/energy";

interface Props {
	sensorId: string;
	sensorType: string;
	timezone: TimeZoneType | null;
	className?: string;
}

export default async function SensorEnergyChartCard(props: Props) {
	const tz = TimezoneTypeToTimeZone[props.timezone || TimeZoneType.Europe_Berlin];
	const baseDate = toZonedTime(new Date(), tz);
	const start = startOfDay(baseDate);
	const end = endOfDay(baseDate);

	const data = await getEnergyForSensorInRange(start.toISOString(), end.toISOString(), props.sensorId);
	const sensorType = props.sensorType as SensorTypeValue;
	const sensorLabel = SensorTypeDisplay[sensorType] ?? "Messwerte";
	const isElectricity = sensorType === SensorType.Electricity;
	const title = isElectricity ? "Stromverbrauch heute" : `${sensorLabel} heute`;
	const description = isElectricity ? "Energieverbrauch im Tagesverlauf." : "Messwerte im Tagesverlauf.";

	const chartConfig = {
		total: {
			label: isElectricity ? "Energieverbrauch (kWh)" : "Messwerte",
			color: "var(--primary)",
		},
	} satisfies ChartConfig;

	if (data.length === 0) {
		return (
			<Card className={props.className}>
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-center font-mono font-semibold">Derzeit stehen keine Daten zur Verfügung.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={props.className}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
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
