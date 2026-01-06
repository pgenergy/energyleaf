import { endOfDay, getDaysInMonth, startOfMonth } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { AlertTriangleIcon, CheckCircle2Icon, Settings2Icon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import CostPredictionChart from "@/components/charts/cost/cost-prediction";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { getCurrentSession } from "@/server/lib/auth";
import { addCostToEnergy, calculatePredictionMetrics, predictedCostImproved } from "@/server/lib/cost";
import { getEnergyForSensorInRange, getHistoricalDailyEnergy } from "@/server/queries/energy";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
import { getUserData } from "@/server/queries/user";

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

interface StatusIndicatorProps {
	status: "on_track" | "warning" | "over_budget";
	percentageOfBudget: number | null;
	projectedSavings: number | null;
	monthlyPayment: number | null;
}

function StatusIndicator({ status, percentageOfBudget, projectedSavings, monthlyPayment }: StatusIndicatorProps) {
	const statusConfig = {
		on_track: {
			icon: CheckCircle2Icon,
			label: "Im Budget",
			color: "text-green-600 dark:text-green-400",
			bgColor: "bg-green-50 dark:bg-green-950",
			borderColor: "border-green-200 dark:border-green-800",
		},
		warning: {
			icon: AlertTriangleIcon,
			label: "Nahe am Budget",
			color: "text-yellow-600 dark:text-yellow-400",
			bgColor: "bg-yellow-50 dark:bg-yellow-950",
			borderColor: "border-yellow-200 dark:border-yellow-800",
		},
		over_budget: {
			icon: XCircleIcon,
			label: "Über Budget",
			color: "text-red-600 dark:text-red-400",
			bgColor: "bg-red-50 dark:bg-red-950",
			borderColor: "border-red-200 dark:border-red-800",
		},
	};

	const config = statusConfig[status];
	const Icon = config.icon;

	if (!monthlyPayment) {
		return null;
	}

	return (
		<div className={cn("flex items-center gap-2 rounded-lg border px-3 py-2", config.bgColor, config.borderColor)}>
			<Icon className={cn("size-5", config.color)} />
			<div className="flex flex-col">
				<span className={cn("font-medium text-sm", config.color)}>{config.label}</span>
				{percentageOfBudget !== null && (
					<span className="text-muted-foreground text-xs">{percentageOfBudget.toFixed(0)}% des Budgets</span>
				)}
				{projectedSavings !== null && projectedSavings > 0 && (
					<span className="text-muted-foreground text-xs">
						Erwartete Ersparnis: {projectedSavings.toFixed(2)} €
					</span>
				)}
				{projectedSavings !== null && projectedSavings < 0 && (
					<span className="text-muted-foreground text-xs">
						Erwartete Mehrkosten: {Math.abs(projectedSavings).toFixed(2)} €
					</span>
				)}
			</div>
		</div>
	);
}

interface MetricsDisplayProps {
	currentTotalCost: number;
	predictedTotalCost: number;
	predictedTotalCostMin: number;
	predictedTotalCostMax: number;
	dailyAverageCost: number;
	monthlyPayment: number | null;
	consumptionGoal: number | null;
}

function MetricsDisplay({
	currentTotalCost,
	predictedTotalCost,
	predictedTotalCostMin,
	predictedTotalCostMax,
	dailyAverageCost,
	monthlyPayment,
	consumptionGoal,
}: MetricsDisplayProps) {
	return (
		<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
			<div className="flex flex-col">
				<span className="text-muted-foreground text-xs">Bisherige Kosten</span>
				<span className="font-mono font-semibold text-lg">{currentTotalCost.toFixed(2)} €</span>
			</div>
			<div className="flex flex-col">
				<span className="text-muted-foreground text-xs">Voraussichtliche Gesamtkosten</span>
				<span className="font-mono font-semibold text-lg">{predictedTotalCost.toFixed(2)} €</span>
				<span className="text-muted-foreground text-xs">
					({predictedTotalCostMin.toFixed(2)} - {predictedTotalCostMax.toFixed(2)} €)
				</span>
			</div>
			<div className="flex flex-col">
				<span className="text-muted-foreground text-xs">Tägliche Durchschnittskosten</span>
				<span className="font-mono font-semibold text-lg">{dailyAverageCost.toFixed(2)} €</span>
			</div>
			{monthlyPayment ? (
				<div className="flex flex-col">
					<span className="text-muted-foreground text-xs">Monatliches Budget</span>
					<span className="font-mono font-semibold text-lg">{monthlyPayment.toFixed(2)} €</span>
				</div>
			) : consumptionGoal ? (
				<div className="flex flex-col">
					<span className="text-muted-foreground text-xs">Verbrauchsziel</span>
					<span className="font-mono font-semibold text-lg">{consumptionGoal.toFixed(0)} kWh</span>
				</div>
			) : (
				<div className="flex flex-col">
					<span className="text-muted-foreground text-xs">Budget/Ziel</span>
					<Link href="/settings/goals" className="text-primary text-sm underline hover:no-underline">
						Jetzt festlegen
					</Link>
				</div>
			)}
		</div>
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

	// Fetch current month data and historical data in parallel
	const [data, historicalData] = await Promise.all([
		getEnergyForSensorInRange(start.toISOString(), end.toISOString(), sensorId, "day", "sum"),
		getHistoricalDailyEnergy(start, sensorId, 14), // Previous 2 weeks
	]);

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

	// Use improved prediction algorithm with historical data
	const predictionData = predictedCostImproved(
		data,
		historicalData && historicalData.length > 0 ? historicalData : null,
		remainingDays,
		userData.workingPrice,
		userData.basePrice,
	);

	// Calculate metrics
	const metrics = calculatePredictionMetrics(
		preparedData,
		predictionData,
		userData.monthlyPayment ?? null,
		userData.consumptionGoal ?? null,
		userData.workingPrice,
		userData.basePrice,
	);

	// Calculate budget/goal line for chart
	const budgetPerDay = userData.monthlyPayment ? userData.monthlyPayment / daysInMonth : null;

	return (
		<Card className="col-span-1 md:col-span-3">
			<CardHead />
			<CardContent className="space-y-6">
				{userData.monthlyPayment && (
					<StatusIndicator
						status={metrics.status}
						percentageOfBudget={metrics.percentageOfBudget}
						projectedSavings={metrics.projectedSavings}
						monthlyPayment={userData.monthlyPayment}
					/>
				)}

				<MetricsDisplay
					currentTotalCost={metrics.currentTotalCost}
					predictedTotalCost={metrics.predictedTotalCost}
					predictedTotalCostMin={metrics.predictedTotalCostMin}
					predictedTotalCostMax={metrics.predictedTotalCostMax}
					dailyAverageCost={metrics.dailyAverageCost}
					monthlyPayment={userData.monthlyPayment ?? null}
					consumptionGoal={userData.consumptionGoal ?? null}
				/>

				<CostPredictionChart
					data={preparedData.map((d) => ({
						...d,
						timestamp: fromZonedTime(d.timestamp, tz),
					}))}
					predictionData={predictionData.map((d) => ({
						...d,
						timestamp: fromZonedTime(d.timestamp, tz),
					}))}
					budgetPerDay={budgetPerDay}
					monthlyBudget={userData.monthlyPayment ?? null}
				/>

				<p className="text-muted-foreground text-center text-xs">
					Die Vorhersage basiert auf Ihren bisherigen Verbrauchsdaten und berücksichtigt Wochentagsmuster
					{historicalData && historicalData.length > 0 && " sowie historische Daten der letzten 2 Wochen"}.
					Der schattierte Bereich zeigt die Unsicherheit der Vorhersage.
				</p>
			</CardContent>
		</Card>
	);
}
