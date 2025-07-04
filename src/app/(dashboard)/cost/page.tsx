import CostBarCard from "@/components/cards/cost/cost-bar-card";
import CostGoalsCard from "@/components/cards/cost/cost-goal-card";
import CostPredictionCard from "@/components/cards/cost/cost-prediction-card";
import LeastCostCard from "@/components/cards/cost/least-cost-card";
import TotalEnergyCostCard from "@/components/cards/cost/total-energy-cost";
import DaySelector from "@/components/date/day-selector";
import { CostPageLayout } from "@/components/layouts/cost-page.layout";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { format, isSameDay, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { de } from "date-fns/locale";
import { ArrowLeftRightIcon, CalendarIcon } from "lucide-react";
import { Suspense } from "react";

type SearchParams = Promise<{ date?: string; compare?: string }>;

interface Props {
	searchParams: SearchParams;
}

export const metadata = {
    title: "Kosten - Energyleaf",
};

export default async function CostPage(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const searchParams = await props.searchParams;
	let date = startOfDay(new Date());
	if (searchParams.date) {
		date = toZonedTime(
			new Date(searchParams.date),
			TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin]
		);
	}
	let compare: Date | undefined = undefined;
	if (searchParams.compare) {
		compare = toZonedTime(
			new Date(searchParams.compare),
			TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin]
		);
	}
	if (compare && isSameDay(date, compare)) {
		compare = undefined;
	}

    if (compare && compare.getTime() > date.getTime()) {
        [date, compare] = [compare, date];
    }

	return (
		<CostPageLayout
			selector={
				<div className="flex flex-col items-center gap-2 md:flex-row">
					<DaySelector
						disallowFuture
						timezone={user.timezone || TimeZoneType.Europe_Berlin}
						range="day"
						href="/cost"
						paramName="date"
					>
						<CalendarIcon className="size-4 opacity-50" />
						{date ? format(date, "PPPP", { locale: de }) : "Datum auswählen"}
					</DaySelector>
					<DaySelector
						disallowFuture
						timezone={user.timezone || TimeZoneType.Europe_Berlin}
						range="day"
						href="/cost"
						paramName="compare"
						showClear={compare !== undefined}
						disallowedDates={[date]}
					>
						<ArrowLeftRightIcon className="size-4 opacity-50" />
						{compare ? format(compare, "PPPP", { locale: de }) : "Vergleichen"}
					</DaySelector>
				</div>
			}
		>
			<h1 className="col-span-1 text-xl font-bold md:col-span-3">Kosten</h1>
			<Suspense fallback={<Skeleton className="h-56" />}>
				<TotalEnergyCostCard start={date} compareStart={compare} />
			</Suspense>
			<Suspense fallback={<Skeleton className="h-56" />}>
				<CostGoalsCard start={date} />
			</Suspense>
			<Suspense fallback={<Skeleton className="h-56" />}>
				<LeastCostCard start={date} agg="hour" />
			</Suspense>
			<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-3" />}>
				<CostBarCard start={date} compareStart={compare} type="day" className="col-span-1 md:col-span-3" />
			</Suspense>
			<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-3" />}>
				<CostPredictionCard />
			</Suspense>
		</CostPageLayout>
	);
}
