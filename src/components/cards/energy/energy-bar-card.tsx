import EnergyBarChart from "@/components/charts/energy/bar-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import type { EnergyData } from "@/server/db/tables/sensor";
import { getCurrentSession } from "@/server/lib/auth";
import { getEnergyForSensorInRange } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { endOfDay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

interface Props {
	start: Date;
	end?: Date;
	compareStart?: Date;
	compareEnd?: Date;
	type: "day" | "week" | "month";
	className?: string;
}

interface HeadProps {
	type: "day" | "week" | "month";
}

function CardHead(props: HeadProps) {
	let text = "Ihr Verbrauch aggregiert in Stunden.";
	if (props.type === "week") {
		text = "Ihr Verbrauch aggregiert in Wochentage.";
	}
	if (props.type === "month") {
		text = "Ihr Verbrauch aggregiert in Wochen.";
	}
	return (
		<CardHeader>
			<CardTitle>Übersicht</CardTitle>
			<CardDescription>{text}</CardDescription>
		</CardHeader>
	);
}

export default async function EnergyBarCard(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const tz = TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin];

	const energySensorId = await getEnergySensorIdForUser(user.id);
	if (!energySensorId) {
		return (
			<Card className={props.className}>
				<CardHead type={props.type} />
				<CardContent>
					<p className="text-center font-mono font-semibold">Derzeit ist kein Sensor bei Ihnen aktiviert.</p>
				</CardContent>
			</Card>
		);
	}

	const start = props.start;
	const end = endOfDay(props.end || props.start);

	let agg: "hour" | "day" | "weekday" | "week" = "hour";
	if (props.type === "week") {
		agg = "weekday";
	} else if (props.type === "month") {
		agg = "week";
	}
	const data = await getEnergyForSensorInRange(start.toISOString(), end.toISOString(), energySensorId, agg, "sum");
	let compareData: EnergyData[] | undefined;
	if (props.compareStart) {
		const compareStart = props.compareStart;
		const compareEnd = endOfDay(props.compareEnd || compareStart);
		compareData = await getEnergyForSensorInRange(
			compareStart.toISOString(),
			compareEnd.toISOString(),
			energySensorId,
			agg,
			"sum",
		);
	}

	const chartConfig = {
		consumption: {
			label: "Energieverbrauch (kWh)",
			color: "var(--primary)",
		},
		consumptionCompare: {
			label: "Vergleich: Energieverbrauch (kWh)",
			color: "var(--chart-1)",
		},
	} satisfies ChartConfig;

	if (!data || data.length === 0) {
		return (
			<Card className={props.className}>
				<CardHead type={props.type} />
				<CardContent>
					<p className="text-center font-mono font-semibold">Derzeit stehen keine Daten zur Verfügung.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={props.className}>
			<CardHead type={props.type} />
			<CardContent>
				<EnergyBarChart
					data={data.map((d) => ({
						...d,
						timestamp: fromZonedTime(d.timestamp, tz),
					}))}
					compareData={compareData?.map((d) => ({
						...d,
						timestamp: fromZonedTime(d.timestamp, tz),
					}))}
					dateFormat={agg}
					display={["consumption"]}
					dataKey="consumption"
					config={chartConfig}
				/>
			</CardContent>
		</Card>
	);
}
