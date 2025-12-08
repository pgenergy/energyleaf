import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/server/lib/auth";
import { getEnergyForSensorInRange } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { endOfDay, format, getWeekOfMonth, isSameDay, isSameWeek, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowDownIcon } from "lucide-react";

interface Props {
	start?: Date;
	end?: Date;
	className?: string;
	agg: "hour" | "day" | "week";
}

interface HeadProps {
	start: Date;
	end: Date;
}

function CardHead(props: HeadProps) {
	const sameDay = isSameDay(props.start, props.end);
	const sameWeek = isSameWeek(props.start, props.end);

	let text = `Sparsamste Stunde`;
	if (!sameDay && !sameWeek) {
		text = `Sparsamste Woche`;
	} else if (!sameDay && sameWeek) {
		text = `Sparsamster Tag`;
	}

	return (
		<CardHeader>
			<CardTitle className="flex items-center gap-1">
				<ArrowDownIcon className="size-4" />
				Geringster Verbrauch
			</CardTitle>
			<CardDescription>{text}</CardDescription>
		</CardHeader>
	);
}

export default async function LeastEnergyConsumptionCard(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const start = startOfDay(props.start || new Date());
	const end = endOfDay(props.end || start);

	const energySensorId = await getEnergySensorIdForUser(user.id);
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

	const data = await getEnergyForSensorInRange(
		start.toISOString(),
		end.toISOString(),
		energySensorId,
		props.agg,
		"sum",
	);
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

	const index = data.reduce((a, b) => (a.consumption < b.consumption ? a : b));
	const value = index.consumption;
	let dateFormat = `${format(index.timestamp, "HH", { locale: de })} Uhr`;
	if (props.agg === "day") {
		dateFormat = format(index.timestamp, "iiii", { locale: de });
	} else if (props.agg === "week") {
		dateFormat = `Woche ${getWeekOfMonth(index.timestamp, { weekStartsOn: 1 })}`;
	}
	return (
		<Card className={props.className}>
			<CardHead start={start} end={end} />
			<CardContent>
				<p className="font-mono font-semibold">
					{value.toFixed(2)} kWh: {dateFormat}
				</p>
			</CardContent>
		</Card>
	);
}
