import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BestDayCard } from "@/components/cards/report/best-day-card";
import { ConsumptionSummaryCard } from "@/components/cards/report/consumption-summary-card";
import { CostSummaryCard } from "@/components/cards/report/cost-summary-card";
import { DailyOverviewCard } from "@/components/cards/report/daily-overview-card";
import { WorstDayCard } from "@/components/cards/report/worst-day-card";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentSession } from "@/server/lib/auth";
import { getReportById } from "@/server/queries/reports";

type Params = Promise<{ id: string }>;

interface Props {
	params: Params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;
	return {
		title: `Bericht ${id} - Energyleaf`,
	};
}

export default async function ReportDetailPage({ params }: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const { id } = await params;
	const report = await getReportById(id, user.id);

	if (!report) {
		notFound();
	}

	const days = report.data.days;
	const firstDay = days.length > 0 ? new Date(days[0].timestamp) : null;
	const lastDay = days.length > 0 ? new Date(days[days.length - 1].timestamp) : null;

	const dateRange =
		firstDay && lastDay
			? `${format(firstDay, "PPP", { locale: de })} - ${format(lastDay, "PPP", { locale: de })}`
			: "Keine Daten";

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<Link href="/reports" className={buttonVariants({ variant: "ghost", size: "sm", className: "w-fit" })}>
					<ArrowLeftIcon className="mr-2 h-4 w-4" />
					Zurück zu Berichten
				</Link>
				<h1 className="text-2xl font-bold">Bericht: {dateRange}</h1>
				<p className="text-muted-foreground">Erstellt am {format(report.timestamp, "PPP", { locale: de })}</p>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<ConsumptionSummaryCard
					totalConsumption={report.data.totalEnergyConsumption}
					avgConsumption={report.data.avgEnergyConsumptionPerDay}
				/>
				<CostSummaryCard totalCost={report.data.totalEnergyCost} avgCost={report.data.avgEnergyCost} />
				<BestDayCard timestamp={report.data.bestDay} consumption={report.data.bestDayConsumption} />
				<WorstDayCard timestamp={report.data.worstDay} consumption={report.data.worstDayConsumption} />
			</div>

			<DailyOverviewCard days={report.data.days} />
		</div>
	);
}
