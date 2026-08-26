import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/server/lib/auth";
import { getEnergyForSensorInRange, hasSolarInputForSensor } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { getSimulationSolarSettings, isSolarSimulationValid } from "@/server/queries/simulations";
import { endOfDay, format, getWeekOfMonth, isSameDay, isSameWeek, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowUpIcon } from "lucide-react";

interface Props {
	start?: Date;
	end?: Date;
	className?: string;
	agg: "hour" | "day" | "week";
}

interface HeadProps {
	start: Date;
	end: Date;
	agg: Props["agg"];
}

function CardHead(props: HeadProps) {
	const sameDay = isSameDay(props.start, props.end);
	const sameWeek = isSameWeek(props.start, props.end);

	let text = "Höchste Einspeisung";
	if (!sameDay && !sameWeek) {
		text = "Höchste Einspeisung pro Woche";
	} else if (!sameDay && sameWeek) {
		text = "Höchste Einspeisung pro Tag";
	}

	return (
		<CardHeader>
			<CardTitle className="flex items-center gap-1">
				<ArrowUpIcon className="size-4" />
				{text}
			</CardTitle>
			<CardDescription>Einspeisung Ihrer Solaranlage</CardDescription>
		</CardHeader>
	);
}

export default async function HighestFeedInCard(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const solarSettings = await getSimulationSolarSettings(user.id);
	if (!isSolarSimulationValid(solarSettings)) {
		return null;
	}

	const start = startOfDay(props.start || new Date());
	const end = endOfDay(props.end || start);

	const energySensorId = await getEnergySensorIdForUser(user.id);
	if (!energySensorId) {
		return null;
	}

	if (!(await hasSolarInputForSensor(energySensorId))) {
		return null;
	}

	const data = await getEnergyForSensorInRange(
		start.toISOString(),
		end.toISOString(),
		energySensorId,
		props.agg,
		"sum",
	);
	if (!data || data.length === 0) {
		return null;
	}

	const index = data.reduce((a, b) => ((a.inserted ?? 0) > (b.inserted ?? 0) ? a : b));
	const value = index.inserted ?? 0;
	let dateFormat = `${format(index.timestamp, "HH", { locale: de })} Uhr`;
	if (props.agg === "day") {
		dateFormat = format(index.timestamp, "iiii", { locale: de });
	} else if (props.agg === "week") {
		dateFormat = `Woche ${getWeekOfMonth(index.timestamp, { weekStartsOn: 1 })}`;
	}
	return (
		<Card className={props.className}>
			<CardHead start={start} end={end} agg={props.agg} />
			<CardContent>
				<p className="font-mono font-semibold">
					{value.toFixed(2)} kWh: {dateFormat}
				</p>
			</CardContent>
		</Card>
	);
}