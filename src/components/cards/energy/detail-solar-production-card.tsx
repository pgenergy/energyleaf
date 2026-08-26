import { endOfDay, startOfDay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import Link from "next/link";
import DetailSolarProductionChart from "@/components/charts/energy/detail-solar-production-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getEnergyForSensorInRange, hasSolarInputForSensor } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { getSimulationSolarSettings, isSolarSimulationValid } from "@/server/queries/simulations";

interface Props {
	title: string;
	description: string;
	className?: string;
}

export default async function DetailSolarProductionCard(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const tz = TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin];

	const start = startOfDay(new Date());
	const end = endOfDay(new Date());

	const solarSettings = await getSimulationSolarSettings(user.id);
	if (!isSolarSimulationValid(solarSettings)) {
		return (
			<Card className={props.className}>
				<CardHeader>
					<CardTitle>{props.title}</CardTitle>
					<CardDescription>{props.description}</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-center font-mono font-semibold">
						Hinterlegen Sie zuerst die Daten Ihrer Solaranlage, um die Einspeisung auszuwerten.
					</p>
					<Button className="mt-4" asChild>
						<Link href="/settings/solar">Zu den Photovoltaik-Einstellungen</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

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

	if (!(await hasSolarInputForSensor(energySensorId))) {
		return (
			<Card className={props.className}>
				<CardHeader>
					<CardTitle>{props.title}</CardTitle>
					<CardDescription>{props.description}</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-center font-mono font-semibold">
						Ihr Stromzähler hat bisher keine Einspeisedaten übermittelt.
					</p>
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
			label: "Solareinspeisung (kWh)",
			color: "var(--chart-4)",
		},
	} satisfies ChartConfig;

	return (
		<Card className={props.className}>
			<CardHeader>
				<CardTitle>{props.title}</CardTitle>
				<CardDescription>{props.description}</CardDescription>
			</CardHeader>
			<CardContent>
				<DetailSolarProductionChart
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
