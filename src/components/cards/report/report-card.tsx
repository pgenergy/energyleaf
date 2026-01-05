import { format } from "date-fns";
import { de } from "date-fns/locale";
import { FileTextIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Report } from "@/server/db/tables/reports";

interface Props {
	report: Report;
}

export default function ReportCard({ report }: Props) {
	const days = report.data.days;
	const firstDay = days.length > 0 ? new Date(days[0].timestamp) : null;
	const lastDay = days.length > 0 ? new Date(days[days.length - 1].timestamp) : null;

	const dateRange =
		firstDay && lastDay
			? `${format(firstDay, "PPP", { locale: de })} - ${format(lastDay, "PPP", { locale: de })}`
			: "Keine Daten";

	return (
		<Link href={`/reports/${report.id}`} className="col-span-1">
			<Card className="hover:bg-accent cursor-pointer transition-colors">
				<CardHeader>
					<div className="flex flex-row items-center gap-4">
						<div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full">
							<FileTextIcon className="h-5 w-5" />
						</div>
						<div className="flex flex-col gap-1">
							<CardTitle className="text-base">{dateRange}</CardTitle>
							<CardDescription>
								Erstellt am {format(report.timestamp, "PPP", { locale: de })}
							</CardDescription>
						</div>
					</div>
				</CardHeader>
			</Card>
		</Link>
	);
}
