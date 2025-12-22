import type { Metadata } from "next";
import { Suspense } from "react";
import TotalEnergyCostCard from "@/components/cards/cost/total-energy-cost";
import DetailEnergyChartCard from "@/components/cards/energy/detail-energy-chart-card";
import EnergyGoalsCard from "@/components/cards/energy/energy-goals-card";
import TotalEnergyConsumptionCard from "@/components/cards/energy/total-consumption-card";
import { Skeleton } from "@/components/ui/skeleton";
import { AutoRefresh } from "@/components/utils/auto-refresh";

export const metadata: Metadata = {
	title: "Übersicht - Energyleaf",
};

export default function DashboardPage() {
	return (
		<>
			<AutoRefresh intervalMs={60000} />
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<h1 className="col-span-1 text-xl font-bold md:col-span-3">Strom</h1>
				<Suspense fallback={<Skeleton className="h-56" />}>
					<TotalEnergyConsumptionCard />
				</Suspense>
				<Suspense fallback={<Skeleton className="h-56" />}>
					<TotalEnergyCostCard />
				</Suspense>
				<Suspense fallback={<Skeleton className="h-56" />}>
					<EnergyGoalsCard />
				</Suspense>
				<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-3" />}>
					<DetailEnergyChartCard
						title="Übersicht des Verbrauchs"
						description="Detailierte Ansicht Ihres Verbrauchs."
						className="col-span-1 md:col-span-3"
					/>
				</Suspense>
			</div>
		</>
	);
}
