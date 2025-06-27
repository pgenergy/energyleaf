import DetailEnergyChart from "@/components/charts/energy/detail-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig } from "@/components/ui/chart";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getEnergyForSensorInRange } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { endOfDay, startOfDay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

interface Props {
	title: string;
	description: string;
	className?: string;
}

export default async function DetailEnergyChartCard(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const tz = TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin];

	const start = startOfDay(new Date());
	const end = endOfDay(new Date());

	const energySensorId = await getEnergySensorIdForUser(user.id);
	if (!energySensorId) {
		return (
			<Card className={props.className}>
				<CardHeader>
					<CardTitle>{props.title}</CardTitle>
					<CardDescription>{props.description}</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-center font-mono font-semibold">Derzeit ist kein Sensor bei Ihnen aktiviert.</p>
				</CardContent>
			</Card>
		);
	}

	const data = await getEnergyForSensorInRange(start.toISOString(), end.toISOString(), energySensorId);
	if (data.length === 0) {
		return (
			<Card className={props.className}>
				<CardHeader>
					<CardTitle>{props.title}</CardTitle>
					<CardDescription>{props.description}</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-center font-mono font-semibold">Derzeit stehen keine Daten zur Verfügung.</p>
				</CardContent>
			</Card>
		);
	}

	const chartConfig = {
		total: {
			label: "Energieübersicht (kWh)",
			color: "var(--primary)",
		},
	} satisfies ChartConfig;

	return (
		<Card className={props.className}>
			<CardHeader>
				<CardTitle>{props.title}</CardTitle>
				<CardDescription>{props.description}</CardDescription>
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
