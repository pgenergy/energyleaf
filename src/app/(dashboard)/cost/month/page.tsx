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
import { endOfMonth, format, isSameMonth, startOfMonth } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { de } from "date-fns/locale";
import { ArrowLeftRightIcon } from "lucide-react";
import { Suspense } from "react";

type SearchParams = Promise<{ start?: string; end?: string; compareStart?: string; compareEnd?: string }>;

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
	let start = startOfMonth(new Date());
	let end = endOfMonth(new Date());
	if (searchParams.start && searchParams.end) {
		start = toZonedTime(
			new Date(searchParams.start),
			TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin],
		);
		end = toZonedTime(
			new Date(searchParams.end),
			TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin],
		);
	}

	let compareStart: Date | undefined;
	let compareEnd: Date | undefined;
	if (searchParams.compareStart && searchParams.compareEnd) {
		compareStart = toZonedTime(
			new Date(searchParams.compareStart),
			TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin],
		);
		compareEnd = toZonedTime(
			new Date(searchParams.compareEnd),
			TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin],
		);
	}
	if (compareStart && isSameMonth(start, compareStart)) {
		compareStart = undefined;
		compareEnd = undefined;
	}

	if (compareStart && compareEnd && compareStart.getTime() > start.getTime()) {
		[start, compareStart] = [compareStart, start];
		[end, compareEnd] = [compareEnd, end];
	}

	return (
		<CostPageLayout
			selector={
				<div className="flex flex-col items-center gap-2 md:flex-row">
					<DaySelector
						disallowFuture
						timezone={user.timezone || TimeZoneType.Europe_Berlin}
						range="month"
						href="/cost/month"
						rangeParamName={["start", "end"]}
					>
						{start
							? `${format(start, "PPP", { locale: de })} - ${format(end, "PPP", { locale: de })}`
							: "Datum auswählen"}
					</DaySelector>
					<DaySelector
						disallowFuture
						timezone={user.timezone || TimeZoneType.Europe_Berlin}
						range="month"
						href="/cost/month"
						rangeParamName={["compareStart", "compareEnd"]}
						showClear={compareStart !== undefined}
					>
						<ArrowLeftRightIcon className="size-4 opacity-50" />
						{compareStart && compareEnd
							? `${format(compareStart, "PPP", { locale: de })} - ${format(compareEnd, "PPP", { locale: de })}`
							: "Vergleichen"}
					</DaySelector>
				</div>
			}
		>
			<h1 className="col-span-1 text-xl font-bold md:col-span-3">Strom</h1>
			<Suspense fallback={<Skeleton className="h-56" />}>
				<TotalEnergyCostCard start={start} end={end} compareStart={compareStart} compareEnd={compareEnd} />
			</Suspense>
			<Suspense fallback={<Skeleton className="h-56" />}>
				<CostGoalsCard start={start} end={end} />
			</Suspense>
			<Suspense fallback={<Skeleton className="h-56" />}>
				<LeastCostCard start={start} end={end} agg="week" />
			</Suspense>
			<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-3" />}>
				<CostBarCard
					start={start}
					end={end}
					compareStart={compareStart}
					compareEnd={compareEnd}
					type="month"
					className="col-span-1 md:col-span-3"
				/>
			</Suspense>
			<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-3" />}>
				<CostPredictionCard />
			</Suspense>
		</CostPageLayout>
	);
}
