import EnergyBarChart from "@/components/charts/energy/bar-chart";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig } from "@/components/ui/chart";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { EnergyData } from "@/server/db/tables/sensor";
import { getCurrentSession } from "@/server/lib/auth";
import { getEnergyForSensorInRange } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { getUserData } from "@/server/queries/user";
import { endOfDay, getDaysInMonth, getWeeksInMonth } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { Settings2Icon } from "lucide-react";
import Link from "next/link";

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
	let text = "Ihre Kosten aggregiert in Stunden.";
	if (props.type === "week") {
		text = "Ihre Kosten aggregiert in Wochentage.";
	}
	if (props.type === "month") {
		text = "Ihre Kosten aggregiert in Wochen.";
	}
	return (
		<CardHeader>
			<div className="flex flex-row justify-between">
				<div className="flex flex-col gap-1">
					<CardTitle>Übersicht</CardTitle>
					<CardDescription>{text}</CardDescription>
				</div>
				<Link className={buttonVariants({ variant: "ghost", size: "icon" })} href="/settings">
					<Settings2Icon className="size-4" />
				</Link>
			</div>
		</CardHeader>
	);
}

export default async function CostBarCard(props: Props) {
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

	const userData = await getUserData(user.id);
	if (!userData) {
		return null;
	}

	if (!userData.workingPrice || !userData.basePrice) {
		return (
			<Card className={props.className}>
				<CardHead type={props.type} />
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

	let agg: "hour" | "day" | "weekday" | "week" = "hour";
	if (props.type === "week") {
		agg = "weekday";
	} else if (props.type === "month") {
		agg = "week";
	}
	const data = await getEnergyForSensorInRange(start.toISOString(), end.toISOString(), energySensorId, agg, "sum");
	let compareData: EnergyData[] | undefined = undefined;
	if (props.compareStart) {
		const compareStart = props.compareStart;
		const compareEnd = endOfDay(props.compareEnd || compareStart);
		compareData = await getEnergyForSensorInRange(
			compareStart.toISOString(),
			compareEnd.toISOString(),
			energySensorId,
			agg,
			"sum"
		);
	}

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

	const weeks = getWeeksInMonth(start);
	const days = getDaysInMonth(start);
	const workingPrice = userData.workingPrice;
	const basePrice = userData.basePrice;
	const preparedData = data.map((d) => {
		const workingCost = d.consumption * workingPrice;
		let baseCost = 0;
		if (agg === "hour") {
			baseCost = basePrice / days / 24;
		} else if (agg === "weekday") {
			baseCost = basePrice / days;
		} else {
			baseCost = basePrice / weeks;
		}

		return {
			...d,
			cost: Number((workingCost + baseCost).toFixed(2)),
		};
	});
	let preparedCompareData: (EnergyData & { cost: number })[] | undefined = undefined;
	if (compareData) {
		preparedCompareData = compareData.map((d) => {
			const workingCost = d.consumption * workingPrice;
			let baseCost = 0;
			if (agg === "hour") {
				baseCost = basePrice / days / 24;
			} else if (agg === "weekday") {
				baseCost = basePrice / days;
			} else {
				baseCost = basePrice / weeks;
			}

			return {
				...d,
				cost: Number((workingCost + baseCost).toFixed(2)),
			};
		});
	}

	const chartConfig = {
		cost: {
			label: "Kosten (€)",
			color: "var(--chart-4)",
		},
		costCompare: {
			label: "Vergleich: Kosten (€)",
			color: "var(--chart-1)",
		},
	} satisfies ChartConfig;

	return (
		<Card className={props.className}>
			<CardHead type={props.type} />
			<CardContent>
				<EnergyBarChart
					data={preparedData.map((d) => ({
						...d,
						timestamp: fromZonedTime(d.timestamp, tz),
					}))}
					compareData={preparedCompareData?.map((d) => ({
						...d,
						timestamp: fromZonedTime(d.timestamp, tz),
					}))}
					dateFormat={agg}
					display={["cost"]}
					dataKey="cost"
					config={chartConfig}
				/>
			</CardContent>
		</Card>
	);
}
