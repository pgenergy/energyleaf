import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EnergyData } from "@/server/db/tables/sensor";
import { getCurrentSession } from "@/server/lib/auth";
import { getEnergyForSensorInRange } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { getUserData } from "@/server/queries/user";
import { differenceInDays, endOfDay, format, getDaysInMonth, isSameDay, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowDownIcon, ArrowUpIcon, DollarSignIcon, Settings2Icon } from "lucide-react";
import Link from "next/link";

interface Props {
	start?: Date;
	end?: Date;
	compareStart?: Date;
	compareEnd?: Date;
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
		text = "Ihre Kosten heute";
	} else if (sameDay) {
		text = format(props.start, "PPP", { locale: de });
	}
	return (
		<CardHeader>
			<div className="flex flex-row justify-between">
				<div className="flex flex-col gap-1">
					<CardTitle className="flex items-center gap-1">
						<DollarSignIcon className="size-4" />
						Kosten
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

export default async function TotalEnergyCostCard(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}
	const userData = await getUserData(user.id);
	if (!userData) {
		return null;
	}

	const start = startOfDay(props.start || new Date());
	const end = endOfDay(props.end || start);

	if (!userData.workingPrice || !userData.basePrice) {
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

	const data = await getEnergyForSensorInRange(start.toISOString(), end.toISOString(), energySensorId, "day", "sum");
	let compareData: EnergyData[] | null = null;
	if (props.compareStart) {
		const compareStart = startOfDay(props.compareStart || new Date());
		const compareEnd = endOfDay(props.compareEnd || start);
		compareData = await getEnergyForSensorInRange(
			compareStart.toISOString(),
			compareEnd.toISOString(),
			energySensorId,
			"day",
			"sum"
		);
	}
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

	const consumption = data.reduce((acc, curr) => curr.consumption + acc, 0);
	const workingCost = consumption * userData.workingPrice;
	const baseCost = (userData.basePrice / daysInMonth) * dayDiff;
	const cost = workingCost + baseCost;

	let compareCost: number | null = null;
	let diff: number | null = null;
	if (compareData) {
		const compareConsumption = compareData[0].consumption;
		const compareWorkingCost = compareConsumption * userData.workingPrice;
		compareCost = compareWorkingCost + baseCost;
		diff = Number((cost / compareCost).toFixed(2));
	}
	return (
		<Card className={props.className}>
			<CardHead start={start} end={end} />
			<CardContent>
				<p className="font-mono font-semibold">{cost.toFixed(2)} €</p>
				{compareCost && diff ? (
					<p
						className={cn(
							{
								"text-primary": diff < 1,
								"text-destructive": diff > 1,
								"text-foreground": diff === 1,
							},
							"mt-4 flex flex-row items-center text-xs"
						)}
					>
						{diff === 1 ? (
							<>ca. gleiche Kosten {compareCost.toFixed(2)} €</>
						) : (
							<>
								{diff < 1 ? (
									<ArrowDownIcon className="mr-1 size-3" />
								) : (
									<ArrowUpIcon className="mr-1 size-3" />
								)}
								{(diff < 1 ? 100 - diff * 100 : diff * 100 - 100).toFixed(0)} %{" "}
								{diff >= 1 ? "mehr Kosten" : "weniger Kosten"}: {compareCost.toFixed(2)} €
							</>
						)}
					</p>
				) : null}
			</CardContent>
		</Card>
	);
}
