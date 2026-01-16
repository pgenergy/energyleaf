import { differenceInDays, endOfDay, format, getDaysInMonth, isSameDay, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { BarChartIcon, Settings2Icon } from "lucide-react";
import Link from "next/link";
import EnergyGoalChart from "@/components/charts/energy/energy-goal-chart";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/server/lib/auth";
import { getEnergyForSensorInRange } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { getUserData } from "@/server/queries/user";

interface Props {
	start?: Date;
	end?: Date;
	className?: string;
}

interface HeadProps {
	start: Date;
	end: Date;
}

function CardHead(props: HeadProps) {
	const sameDay = isSameDay(props.start, props.end);
	const today = isSameDay(new Date(), props.start);

	let text = `${format(props.start, "PPP", { locale: de })} - ${format(props.end, "PPP", { locale: de })}`;
	if (today) {
		text = "Ihr aktueller Verbrauch im Vergleich zum Limit.";
	} else if (sameDay) {
		text = format(props.start, "PPP", { locale: de });
	}

	return (
		<CardHeader>
			<div className="flex flex-row justify-between">
				<div className="flex flex-col gap-1">
					<CardTitle className="flex items-center gap-1">
						<BarChartIcon className="size-4" />
						Verbrauchslimit
					</CardTitle>
					<CardDescription>{text}</CardDescription>
				</div>
				<Link className={buttonVariants({ variant: "ghost", size: "icon" })} href="/settings/goals">
					<Settings2Icon className="size-4" />
				</Link>
			</div>
		</CardHeader>
	);
}

export default async function EnergyGoalsCard(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const start = startOfDay(props.start || new Date());
	const end = endOfDay(props.end || start);

	const userData = await getUserData(user.id);
	if (!userData) {
		return null;
	}

	if (!userData.consumptionGoal) {
		return (
			<Card className={props.className}>
				<CardHead start={start} end={end} />
				<CardContent>
					<p className="text-center font-mono font-semibold">
						Hinterlegen Sie Ihre Limits in den{" "}
						<Link href="/settings/goals" className="underline hover:no-underline">
							Einstellungen
						</Link>{" "}
						.
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

	const data = await getEnergyForSensorInRange(start.toISOString(), end.toISOString(), energySensorId, "day", "sum");
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

	const daysInMonth = getDaysInMonth(start);
	const dayDiff = differenceInDays(end, start) + 1;
	const goal = (userData.consumptionGoal / daysInMonth) * dayDiff;
	const total = data.reduce((acc, curr) => curr.consumption + acc, 0);
	const progress = (total / goal) * 100;
	const remaining = goal - total;

	return (
		<Card className={props.className}>
			<CardHead start={start} end={end} />
			<CardContent>
				<EnergyGoalChart goal={goal} total={total} progress={progress} remaining={remaining} />
			</CardContent>
		</Card>
	);
}
