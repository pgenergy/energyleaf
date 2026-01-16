import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarDaysIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DayReport } from "@/server/db/tables/reports";

interface Props {
	days: DayReport["days"];
}

export function DailyOverviewCard({ days }: Props) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center gap-2">
				<CalendarDaysIcon className="h-5 w-5" />
				<div>
					<CardTitle>Tagesübersicht</CardTitle>
					<CardDescription>Verbrauch und Kosten pro Tag</CardDescription>
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Tag</TableHead>
							<TableHead className="text-right">Verbrauch</TableHead>
							<TableHead className="text-right">Kosten</TableHead>
							<TableHead>Fortschritt zum Ziel</TableHead>
							<TableHead className="text-center">Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{days.map((day) => {
							const date = new Date(day.timestamp);
							return (
								<TableRow key={day.timestamp}>
									<TableCell className="font-medium">
										{format(date, "EEE, dd.MM.", { locale: de })}
									</TableCell>
									<TableCell className="text-right">{day.consumption.toFixed(2)} kWh</TableCell>
									<TableCell className="text-right">{day.cost.toFixed(2)} €</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Progress
												value={Math.min(day.progress, 100)}
												className={cn("h-2 w-24", day.exceeded && "[&>div]:bg-red-500")}
											/>
											<span className="text-muted-foreground text-xs">
												{day.progress.toFixed(2)}%
											</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										{day.exceeded ? (
											<Badge variant="destructive">Überschritten</Badge>
										) : (
											<Badge variant="secondary">Im Ziel</Badge>
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
