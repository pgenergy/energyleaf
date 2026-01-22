import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTopPageViews } from "@/server/queries/analytics";

const numberFormatter = new Intl.NumberFormat("de-DE");

interface Props {
	className?: string;
	start: Date;
	end: Date;
	rangeLabel: string;
	userId?: string;
}

export default async function AnalyticsTopPagesCard(props: Props) {
	const pages = await getTopPageViews(props.start, props.end, 8, props.userId);

	return (
		<Card className={props.className}>
			<CardHeader>
				<CardTitle>Top-Seiten</CardTitle>
				<CardDescription>Meistbesuchte Seiten im Zeitraum {props.rangeLabel}.</CardDescription>
			</CardHeader>
			<CardContent>
				{pages.length === 0 ? (
					<p className="text-center font-mono font-semibold">Keine Seitenaufrufe vorhanden.</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Seite</TableHead>
								<TableHead className="text-right">Aufrufe</TableHead>
								<TableHead className="text-right">Nutzer</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{pages.map((page) => (
								<TableRow key={page.path}>
									<TableCell className="max-w-52 truncate font-mono text-xs">{page.path}</TableCell>
									<TableCell className="text-right">{numberFormatter.format(page.total)}</TableCell>
									<TableCell className="text-right">
										{numberFormatter.format(page.uniqueUsers)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
