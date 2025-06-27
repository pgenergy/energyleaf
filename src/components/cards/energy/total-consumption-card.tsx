import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EnergyData } from "@/server/db/tables/sensor";
import { getCurrentSession } from "@/server/lib/auth";
import { getEnergyForSensorInRange } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { endOfDay, format, isSameDay, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowDownIcon, ArrowUpIcon, ZapIcon } from "lucide-react";

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
		text = "Ihr Verbrauch heute";
	} else if (sameDay) {
		text = format(props.start, "PPP", { locale: de });
	}

	return (
		<CardHeader>
			<CardTitle className="flex items-center gap-1">
				<ZapIcon className="size-4" />
				Verbrauch
			</CardTitle>
			<CardDescription>{text}</CardDescription>
		</CardHeader>
	);
}

export default async function TotalEnergyConsumptionCard(props: Props) {
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

	const value = data[0].consumption;
	let compareValue: number | null = null;
	let diff: number | null = null;
	if (compareData) {
		compareValue = compareData[0].consumption;
		diff = Number((value / compareValue).toFixed(2));
	}
	return (
		<Card className={props.className}>
			<CardHead start={start} end={end} />
			<CardContent>
				<p className="font-mono font-semibold">{value.toFixed(2)} kWh</p>
				{compareValue && diff ? (
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
							<>ca. gleicher Verbrauch: {compareValue.toFixed(2)} kWh</>
						) : (
							<>
								{diff < 1 ? (
									<ArrowDownIcon className="mr-1 size-3" />
								) : (
									<ArrowUpIcon className="mr-1 size-3" />
								)}
								{(diff < 1 ? 100 - diff * 100 : diff * 100 - 100).toFixed(0)} %{" "}
								{diff > 1 ? "mehr Verbrauch" : diff < 1 ? "weniger Verbrauch" : "gleicher Verbrauch"}:{" "}
								{compareValue.toFixed(2)} kWh
							</>
						)}
					</p>
				) : null}
			</CardContent>
		</Card>
	);
}
