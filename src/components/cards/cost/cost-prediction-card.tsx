import CostPredictionChart from "@/components/charts/cost/cost-prediction";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { addCostToEnergy, predictedCost } from "@/server/lib/cost";
import { getEnergyForSensorInRange } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { getUserData } from "@/server/queries/user";
import { endOfDay, getDaysInMonth, startOfMonth } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { Settings2Icon } from "lucide-react";
import Link from "next/link";

function CardHead() {
	return (
		<CardHeader>
			<div className="flex flex-row justify-between">
				<div className="flex flex-col gap-1">
					<CardTitle>Kostenvorhersage</CardTitle>
					<CardDescription>Hier sehen Sie eine Vorhersage der Kosten für diesen Monat</CardDescription>
				</div>
				<Link className={buttonVariants({ variant: "ghost", size: "icon" })} href="/settings/goals">
					<Settings2Icon className="size-4" />
				</Link>
			</div>
		</CardHeader>
	);
}

export default async function CostPredictionCard() {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const tz = TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin];

	const userData = await getUserData(user.id);
	if (!userData) {
		return null;
	}

	if (!userData.workingPrice || !userData.basePrice) {
		return (
			<Card>
				<CardHead />
				<CardContent>
					<p className="text-center font-mono font-semibold">
						Hinterlegen Sie ihren Tarif in den{" "}
						<Link href="/settings" className="underline hover:no-underline">
							Einstellungen
						</Link>{" "}
						.
					</p>
				</CardContent>
			</Card>
		);
	}

	const sensorId = await getEnergySensorIdForUser(user.id);
	if (!sensorId) {
		return (
			<Card>
				<CardHead />
				<CardContent>
					<p className="text-center font-mono font-semibold">Derzeit ist kein Sensor bei Ihnen aktiviert.</p>
				</CardContent>
			</Card>
		);
	}

	const start = startOfMonth(new Date());
	const end = endOfDay(new Date());

	const daysInMonth = getDaysInMonth(start);
	const currentDay = new Date().getDate();
	const remainingDays = daysInMonth - currentDay;

	const data = await getEnergyForSensorInRange(start.toISOString(), end.toISOString(), sensorId, "day", "sum");
	if (!data || data.length === 0) {
		return (
			<Card>
				<CardHead />
				<CardContent>
					<p className="text-center font-mono font-semibold">Derzeit stehen keine Daten zur Verfügung.</p>
				</CardContent>
			</Card>
		);
	}

	if (data.length < 3) {
		return (
			<Card>
				<CardHead />
				<CardContent>
					<p className="text-center font-mono font-semibold">
						Es stehen noch nicht genug Daten zur Verfügung.
					</p>
				</CardContent>
			</Card>
		);
	}

	const preparedData = addCostToEnergy(data, userData.workingPrice, userData.basePrice, "day");
	const predictionData = predictedCost(data, remainingDays, userData.workingPrice, userData.basePrice);
	const totalCost = [...preparedData, ...predictionData].reduce((curr, acc) => curr + acc.cost, 0);

	return (
		<Card className="col-span-1 md:col-span-3">
			<CardHead />
			<CardContent>
				<p className="pt-4 text-center font-mono font-semibold">Erwartete Kosten: {totalCost.toFixed(2)} €</p>
				<CostPredictionChart
					data={preparedData.map((d) => ({
						...d,
						timestamp: fromZonedTime(d.timestamp, tz),
					}))}
					predictionData={predictionData.map((d) => ({
						...d,
						timestamp: fromZonedTime(d.timestamp, tz),
					}))}
				/>
			</CardContent>
		</Card>
	);
}
