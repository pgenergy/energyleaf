import TotalEnergyCostCard from "@/components/cards/cost/total-energy-cost";
import EnergyBarCard from "@/components/cards/energy/energy-bar-card";
import EnergyGoalsCard from "@/components/cards/energy/energy-goals-card";
import LeastEnergyConsumptionCard from "@/components/cards/energy/least-energy-consumption-card";
import TotalEnergyConsumptionCard from "@/components/cards/energy/total-consumption-card";
import DaySelector from "@/components/date/day-selector";
import { EnergyPageLayout } from "@/components/layouts/energy-page-layout";
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
	title: "Strom - Energyleaf",
};

export default async function EnergyPage(props: Props) {
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
		<EnergyPageLayout
			selector={
				<div className="flex flex-col items-center gap-2 md:flex-row">
					<DaySelector
						disallowFuture
						timezone={user.timezone || TimeZoneType.Europe_Berlin}
						range="month"
						href="/energy/month"
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
						href="/energy/month"
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
				<TotalEnergyConsumptionCard
					start={start}
					end={end}
					compareStart={compareStart}
					compareEnd={compareEnd}
				/>
			</Suspense>
			<Suspense fallback={<Skeleton className="h-56" />}>
				<TotalEnergyCostCard start={start} end={end} compareStart={compareStart} compareEnd={compareEnd} />
			</Suspense>
			<Suspense fallback={<Skeleton className="h-56" />}>
				<EnergyGoalsCard start={start} end={end} />
			</Suspense>
			<Suspense fallback={<Skeleton className="h-56" />}>
				<LeastEnergyConsumptionCard start={start} end={end} agg="week" />
			</Suspense>
			<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-3" />}>
				<EnergyBarCard
					start={start}
					end={end}
					compareStart={compareStart}
					compareEnd={compareEnd}
					type="month"
					className="col-span-1 md:col-span-3"
				/>
			</Suspense>
		</EnergyPageLayout>
	);
}
