import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/server/lib/auth";
import { getEnergyForSensorInRange } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { getUserData } from "@/server/queries/user";
import {
	endOfDay,
	format,
	getDaysInMonth,
	getWeekOfMonth,
	getWeeksInMonth,
	isSameDay,
	isSameWeek,
	startOfDay,
} from "date-fns";
import { de } from "date-fns/locale";
import { ArrowDownIcon, Settings2Icon } from "lucide-react";
import Link from "next/link";

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
			<div className="flex flex-row justify-between">
				<div className="flex flex-col gap-1">
					<CardTitle className="flex items-center gap-1">
						<ArrowDownIcon className="size-4" />
						Geringste Kosten
					</CardTitle>
					<CardDescription>{text}</CardDescription>
				</div>
				<Link className={buttonVariants({ variant: "ghost", size: "icon" })} href="/settings">
					<Settings2Icon className="size-4" />
				</Link>
			</div>
		</CardHeader>
	);
}

export default async function LeastCostCard(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const start = startOfDay(props.start || new Date());
	const end = endOfDay(props.end || start);

	const userData = await getUserData(user.id);
	if (!userData || !userData.workingPrice || !userData.basePrice) {
		return (
			<Card className={props.className}>
				<CardHead start={start} end={end} />
				<CardContent>
					<p className="text-center font-mono font-semibold">
						Hinterlegen Sie in den{" "}
						<Link href="/settings" className="underline hover:no-underline">
							Einstellungen
						</Link>{" "}
						Ihren Tarif.
					</p>
				</CardContent>
			</Card>
		);
	}

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
		"sum"
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
	const workingPrice = userData.workingPrice;
	const workingCost = value * workingPrice;
	const basePrice = userData.basePrice;
	let baseCost = 0;
	if (props.agg === "hour") {
		baseCost = basePrice / getDaysInMonth(start) / 24;
	} else if (props.agg === "day") {
		baseCost = basePrice / getDaysInMonth(start);
	} else {
		baseCost = basePrice / getWeeksInMonth(start);
	}

	const cost = Number((workingCost + baseCost).toFixed(2));

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
					{cost} €: {dateFormat}
				</p>
			</CardContent>
		</Card>
	);
}
