import { endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import type { Metadata } from "next";
import { Suspense } from "react";
import CostBarCard from "@/components/cards/cost/cost-bar-card";
import CostPredictionCard from "@/components/cards/cost/cost-prediction-card";
import TotalEnergyCostCard from "@/components/cards/cost/total-energy-cost-card";
import DetailEnergyChartCard from "@/components/cards/energy/detail-energy-chart-card";
import DetailSolarProductionCard from "@/components/cards/energy/detail-solar-production-card";
import EnergyBarCard from "@/components/cards/energy/energy-bar-card";
import EnergyGoalsCard from "@/components/cards/energy/energy-goals-card";
import SolarProductionCard, { SolarProductionCardSkeleton } from "@/components/cards/energy/solar-production-card";
import TotalEnergyConsumptionCard from "@/components/cards/energy/total-consumption-card";
import SimulationCostBarChartCard from "@/components/cards/simulation/simulation-cost-bar-chart-card";
import SimulationDetailChartCard from "@/components/cards/simulation/simulation-detail-chart-card";
import DashboardConfigDialog from "@/components/dashboard/dashboard-config-dialog";
import { HintAlertWrapper } from "@/components/dashboard/hint-alert-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { AutoRefresh } from "@/components/utils/auto-refresh";
import { env } from "@/env";
import {
	type DashboardComponentId,
	DEFAULT_DASHBOARD_COMPONENTS,
	sortComponentsByOrder,
} from "@/lib/dashboard-components";
import { getCurrentSession } from "@/server/lib/auth";
import { getDashboardConfig } from "@/server/queries/dashboard";
import { getUserData } from "@/server/queries/user";
import {
	getEnabledSimulations,
	getSimulationSolarSettings,
	isSolarSimulationValid,
} from "@/server/queries/simulations";

export const metadata: Metadata = {
	title: "Dashboard - Energyleaf",
};

export default async function DashboardPage() {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const experimentMode = !env.DISABLE_EXPERIMENT;

	const [dashboardConfig, enabledSimulations, solarSettings] = await Promise.all([
		getDashboardConfig(user.id),
		getEnabledSimulations(user.id),
		getSimulationSolarSettings(user.id),
	]);
	const hasSolar = isSolarSimulationValid(solarSettings);
	const userData = await getUserData(user.id);
	const showSolarFeedIn = userData?.showSolarFeedIn ?? false;

	const hasSimulations = !!(
		enabledSimulations.ev ||
		enabledSimulations.solar ||
		enabledSimulations.heatpump ||
		enabledSimulations.battery ||
		enabledSimulations.tou
	);

	const activeComponentIds = dashboardConfig?.activeComponents ?? DEFAULT_DASHBOARD_COMPONENTS;
	const activeComponents = sortComponentsByOrder(activeComponentIds);

	const today = new Date();
	const startOfToday = startOfDay(today);
	const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
	const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
	const startOfThisMonth = startOfMonth(today);
	const endOfThisMonth = endOfMonth(today);

	const isActive = (id: DashboardComponentId) => activeComponents.includes(id);

	const defaultFilters = {
		ev: true,
		solar: true,
		heatpump: true,
		battery: true,
		tou: true,
	};

	return (
		<>
			<AutoRefresh intervalMs={60000} />
			{experimentMode && (
				<Suspense fallback={null}>
					<HintAlertWrapper />
				</Suspense>
			)}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div className="col-span-1 flex items-center justify-between md:col-span-3">
					<h1 className="text-xl font-bold">Dashboard</h1>
					<DashboardConfigDialog
						activeComponents={activeComponents}
						hasSimulations={hasSimulations}
						hasSolar={hasSolar}
					/>
				</div>

				{isActive("total-consumption") && (
					<Suspense fallback={<Skeleton className="h-56" />}>
						<TotalEnergyConsumptionCard />
					</Suspense>
				)}
				{isActive("total-cost") && (
					<Suspense fallback={<Skeleton className="h-56" />}>
						<TotalEnergyCostCard />
					</Suspense>
				)}
				{isActive("energy-goals") && (
					<Suspense fallback={<Skeleton className="h-56" />}>
						<EnergyGoalsCard />
					</Suspense>
				)}

				{isActive("detail-energy") && (
					<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-3" />}>
						<DetailEnergyChartCard
							title="Übersicht des Verbrauchs"
							description="Detaillierte Ansicht Ihres Verbrauchs."
							className="col-span-1 md:col-span-3"
						/>
					</Suspense>
				)}

				{showSolarFeedIn && isActive("detail-solar-production") && (
					<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-3" />}>
						<DetailSolarProductionCard
							title="Übersicht der Solareinspeisung"
							description="Detallierte Ansicht Ihrer Einspeisung ins Stromnetz"
							className="col-span-1 md:col-span-3"
						/>
					</Suspense>
				)}

				{hasSolar && showSolarFeedIn && isActive("solar-production") && (
					<Suspense fallback={<SolarProductionCardSkeleton className="col-span-1 md:col-span-3" />}>
						<SolarProductionCard start={startOfToday} type="day" className="col-span-1 md:col-span-3" />
					</Suspense>
				)}

				{isActive("energy-bar-day") && (
					<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-3" />}>
						<EnergyBarCard start={startOfToday} type="day" className="col-span-1 md:col-span-3" />
					</Suspense>
				)}
				{isActive("energy-bar-week") && (
					<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-3" />}>
						<EnergyBarCard start={startOfThisWeek} end={endOfThisWeek} type="week" className="col-span-1 md:col-span-3" />
					</Suspense>
				)}
				{isActive("energy-bar-month") && (
					<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-3" />}>
						<EnergyBarCard start={startOfThisMonth} end={endOfThisMonth} type="month" className="col-span-1 md:col-span-3" />
					</Suspense>
				)}

				{isActive("cost-bar-day") && (
					<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-3" />}>
						<CostBarCard start={startOfToday} type="day" className="col-span-1 md:col-span-3" />
					</Suspense>
				)}
				{isActive("cost-bar-week") && (
					<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-3" />}>
						<CostBarCard start={startOfThisWeek} end={endOfThisWeek} type="week" className="col-span-1 md:col-span-3" />
					</Suspense>
				)}
				{isActive("cost-bar-month") && (
					<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-3" />}>
						<CostBarCard start={startOfThisMonth} end={endOfThisMonth} type="month" className="col-span-1 md:col-span-3" />
					</Suspense>
				)}

				{isActive("cost-prediction") && (
					<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-3" />}>
						<CostPredictionCard />
					</Suspense>
				)}

				{hasSimulations && isActive("simulation-detail") && (
					<Suspense fallback={<Skeleton className="col-span-1 max-h-96 h-96 md:col-span-3" />}>
						<div className="col-span-1 md:col-span-3">
							<SimulationDetailChartCard
								userId={user.id}
								timezone={user.timezone}
								start={startOfToday}
								filters={defaultFilters}
							/>
						</div>
					</Suspense>
				)}
				{hasSimulations && isActive("simulation-cost") && (
					<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-3" />}>
						<div className="col-span-1 md:col-span-3">
							<SimulationCostBarChartCard
								userId={user.id}
								timezone={user.timezone}
								start={startOfToday}
								filters={defaultFilters}
							/>
						</div>
					</Suspense>
				)}
			</div>
		</>
	);
}
