import { endOfMonth, format, startOfMonth } from "date-fns";
import { de } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { CalendarIcon, DownloadIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AnalyticsActionsCard from "@/components/cards/analytics/analytics-actions-card";
import AnalyticsOverviewCard from "@/components/cards/analytics/analytics-overview-card";
import AnalyticsPageViewsCard from "@/components/cards/analytics/analytics-pageviews-card";
import AnalyticsTopActionsCard from "@/components/cards/analytics/analytics-top-actions-card";
import AnalyticsTopPagesCard from "@/components/cards/analytics/analytics-top-pages-card";
import DaySelector from "@/components/date/day-selector";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";

export const metadata: Metadata = {
	title: "Analytics - Admin - Energyleaf",
};

type SearchParams = Promise<{ start?: string; end?: string }>;

interface Props {
	searchParams: SearchParams;
}

export default async function AdminAnalyticsPage(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		redirect("/login");
	}

	if (!user.isAdmin) {
		redirect("/dashboard");
	}

	const searchParams = await props.searchParams;
	const timezone = user.timezone || TimeZoneType.Europe_Berlin;
	const tz = TimezoneTypeToTimeZone[timezone];
	const startParam = searchParams.start ?? searchParams.end;
	const baseDate = startParam ? toZonedTime(new Date(startParam), tz) : toZonedTime(new Date(), tz);
	const start = startOfMonth(baseDate);
	const end = endOfMonth(baseDate);
	const rangeLabel = `${format(start, "PPP", { locale: de })} - ${format(end, "PPP", { locale: de })}`;
	const downloadUrl = `/api/admin/analytics-export?start=${encodeURIComponent(
		start.toISOString(),
	)}&end=${encodeURIComponent(end.toISOString())}`;

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div className="col-span-1 flex flex-col gap-4 md:col-span-2 md:flex-row md:items-center md:justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="text-xl font-bold">Analytics</h1>
					<p className="text-muted-foreground text-sm">Einblick in Seitenaufrufe und Nutzeraktionen.</p>
				</div>
				<div className="flex flex-col items-center gap-2 sm:flex-row">
					<DaySelector
						disallowFuture
						timezone={timezone}
						range="month"
						href="/admin/analytics"
						rangeParamName={["start", "end"]}
					>
						<CalendarIcon className="size-4 opacity-50" />
						{rangeLabel}
					</DaySelector>
					<Link className={buttonVariants({ variant: "outline" })} href={downloadUrl} prefetch={false}>
						<DownloadIcon className="size-4" />
						CSV herunterladen
					</Link>
				</div>
			</div>
			<Suspense fallback={<Skeleton className="col-span-1 h-48 md:col-span-2" />}>
				<AnalyticsOverviewCard
					className="col-span-1 md:col-span-2"
					start={start}
					end={end}
					rangeLabel={rangeLabel}
				/>
			</Suspense>
			<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-2" />}>
				<AnalyticsPageViewsCard
					className="col-span-1 md:col-span-2"
					start={start}
					end={end}
					rangeLabel={rangeLabel}
				/>
			</Suspense>
			<Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-2" />}>
				<AnalyticsActionsCard
					className="col-span-1 md:col-span-2"
					start={start}
					end={end}
					rangeLabel={rangeLabel}
				/>
			</Suspense>
			<Suspense fallback={<Skeleton className="col-span-1 h-80" />}>
				<AnalyticsTopPagesCard start={start} end={end} rangeLabel={rangeLabel} />
			</Suspense>
			<Suspense fallback={<Skeleton className="col-span-1 h-80" />}>
				<AnalyticsTopActionsCard start={start} end={end} rangeLabel={rangeLabel} />
			</Suspense>
		</div>
	);
}
