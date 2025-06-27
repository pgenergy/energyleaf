import { PeaksOverview } from "@/components/cards/peaks/peaks-overview";
import DaySelector from "@/components/date/day-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { de } from "date-fns/locale";
import { Suspense } from "react";

type SearchParams = Promise<{ start?: string; end?: string; compareStart?: string; compareEnd?: string }>;

interface Props {
	searchParams: SearchParams;
}

export const metadata = {
    title: "Ausschläge - Energyleaf",
};

export default async function DevicesPage(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const searchParams = await props.searchParams;
	let start = startOfWeek(new Date(), { weekStartsOn: 1 });
	let end = endOfWeek(new Date(), { weekStartsOn: 1 });
	if (searchParams.start && searchParams.end) {
		start = toZonedTime(
			new Date(searchParams.start),
			TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin]
		);
		end = toZonedTime(
			new Date(searchParams.end),
			TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin]
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div className="col-span-1 flex flex-col items-center justify-between gap-2 md:col-span-3 md:flex-row">
				<h1 className="text-xl font-bold">Ausschläge</h1>
				<DaySelector
					disallowFuture
					timezone={user.timezone || TimeZoneType.Europe_Berlin}
					range="week"
					href="/peaks"
					rangeParamName={["start", "end"]}
				>
					{start
						? `${format(start, "PPP", { locale: de })} - ${format(end, "PPP", { locale: de })}`
						: "Datum auswählen"}
				</DaySelector>
			</div>
			<Suspense fallback={<Skeleton className="col-span-1 h-56 md:col-span-3" />}>
				<PeaksOverview start={start} end={end} />
			</Suspense>
		</div>
	);
}
