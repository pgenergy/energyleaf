import { format, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { CalendarIcon, SettingsIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import TotalEnergyCostCard from "@/components/cards/cost/total-energy-cost";
import TotalEnergyConsumptionCard from "@/components/cards/energy/total-consumption-card";
import SimulationBarChartCard from "@/components/cards/simulation/simulation-bar-chart-card";
import SimulationCostBarChartCard from "@/components/cards/simulation/simulation-cost-bar-chart-card";
import SimulationDetailChartCard from "@/components/cards/simulation/simulation-detail-chart-card";
import DaySelector from "@/components/date/day-selector";
import SimulationFilter from "@/components/forms/simulation/simulation-filter";
import { SimulationPageLayout } from "@/components/layouts/simulation-page-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AutoRefresh } from "@/components/utils/auto-refresh";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getEnabledSimulations } from "@/server/queries/simulations";

type SearchParams = Promise<{
	date?: string;
	ev?: string;
	solar?: string;
	heatpump?: string;
	battery?: string;
	tou?: string;
}>;

interface Props {
	searchParams: SearchParams;
}

export const metadata: Metadata = {
	title: "Simulation - Energyleaf",
};

export default async function SimulationPage(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const searchParams = await props.searchParams;
	const tz = TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin];

	let date = startOfDay(new Date());
	if (searchParams.date) {
		date = toZonedTime(new Date(searchParams.date), tz);
	}

	const enabledSimulations = await getEnabledSimulations(user.id);
	const hasAnyEnabled = !!(
		enabledSimulations.ev ||
		enabledSimulations.solar ||
		enabledSimulations.heatpump ||
		enabledSimulations.battery
	);

	const enabledSimulationsFlags = {
		ev: !!enabledSimulations.ev,
		solar: !!enabledSimulations.solar,
		heatpump: !!enabledSimulations.heatpump,
		battery: !!enabledSimulations.battery,
		tou: !!enabledSimulations.tou,
	};

	const settingsLink = user.isSimulationFree ? (
		<Link href="/settings/simulation" className={buttonVariants({ variant: "outline", size: "default" })}>
			<SettingsIcon className="size-4 md:mr-2" />
			<span className="hidden md:inline">Einstellungen</span>
		</Link>
	) : undefined;

	const filters = {
		ev: searchParams.ev !== "false",
		solar: searchParams.solar !== "false",
		heatpump: searchParams.heatpump !== "false",
		battery: searchParams.battery !== "false",
		tou: searchParams.tou !== "false",
	};

	if (!hasAnyEnabled) {
		if (!user.isSimulationFree) {
			redirect("/dashboard");
		}

		return (
			<Card>
				<CardHeader>
					<CardTitle>Keine Simulationen konfiguriert</CardTitle>
					<CardDescription>
						Sie haben noch keine Simulationen konfiguriert. Richten Sie Ihre Simulationen in den
						Einstellungen ein, um zu sehen, wie sich Ihr Energieverbrauch verändern könnte.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild>
						<Link href="/settings/simulation">
							<SettingsIcon className="mr-2 size-4" />
							Zu den Simulationseinstellungen
						</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<AutoRefresh intervalMs={120000} />
			<SimulationPageLayout
				selector={
					<DaySelector
						disallowFuture
						timezone={user.timezone || TimeZoneType.Europe_Berlin}
						range="day"
						href="/simulation"
						paramName="date"
					>
						<CalendarIcon className="size-4 opacity-50" />
						{date ? format(date, "PPPP", { locale: de }) : "Datum auswählen"}
					</DaySelector>
				}
				filter={<SimulationFilter enabledSimulations={enabledSimulationsFlags} />}
				settingsLink={settingsLink}
				cards={
					<>
						<Suspense fallback={<Skeleton className="h-56" />}>
							<TotalEnergyConsumptionCard start={date} filters={filters} showSimulation />
						</Suspense>
						<Suspense fallback={<Skeleton className="h-56" />}>
							<TotalEnergyCostCard start={date} filters={filters} showSimulation />
						</Suspense>
					</>
				}
			>
				<Suspense fallback={<Skeleton className="h-96" />}>
					<SimulationDetailChartCard
						userId={user.id}
						timezone={user.timezone}
						start={date}
						filters={filters}
					/>
				</Suspense>
				<Suspense fallback={<Skeleton className="h-96" />}>
					<SimulationBarChartCard userId={user.id} timezone={user.timezone} start={date} filters={filters} />
				</Suspense>
				<Suspense fallback={<Skeleton className="h-96" />}>
					<SimulationCostBarChartCard
						userId={user.id}
						timezone={user.timezone}
						start={date}
						filters={filters}
					/>
				</Suspense>
			</SimulationPageLayout>
		</>
	);
}
