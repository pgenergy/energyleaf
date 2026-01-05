/** biome-ignore-all lint/suspicious/noArrayIndexKey: fine here */
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { getCurrentSession } from "@/server/lib/auth";
import { getReportsPage } from "@/server/queries/reports";
import ReportCard from "./report-card";

interface Props {
	page: number;
	pageSize: number;
}

export async function ReportsOverview({ page, pageSize }: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const { reports, total } = await getReportsPage({ userId: user.id, page, pageSize });

	const pageCount = Math.ceil(total / pageSize) || 1;

	const buildHref = (targetPage: number) => {
		const params = new URLSearchParams();
		params.set("page", String(targetPage));
		return `/reports?${params.toString()}`;
	};

	if (total === 0) {
		return (
			<div className="col-span-1 md:col-span-3">
				<p className="text-center font-mono font-semibold">Bisher wurden keine Berichte erstellt.</p>
			</div>
		);
	}

	if (reports.length === 0 && total > 0) {
		return (
			<div className="col-span-1 flex flex-col items-center gap-4 md:col-span-3">
				<p className="text-center font-mono font-semibold">Diese Seite enthält keine Berichte.</p>
				<Link href={buildHref(1)} className={cn(buttonVariants({ variant: "default" }))}>
					Zur ersten Seite
				</Link>
			</div>
		);
	}

	const startIdx = (page - 1) * pageSize + 1;
	const endIdx = Math.min(page * pageSize, total);

	const getPageNumbers = () => {
		const pages: (number | "ellipsis")[] = [];
		const maxVisible = 5;

		if (pageCount <= maxVisible) {
			for (let i = 1; i <= pageCount; i++) {
				pages.push(i);
			}
		} else {
			pages.push(1);

			if (page > 3) {
				pages.push("ellipsis");
			}

			const start = Math.max(2, page - 1);
			const end = Math.min(pageCount - 1, page + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (page < pageCount - 2) {
				pages.push("ellipsis");
			}

			pages.push(pageCount);
		}

		return pages;
	};

	return (
		<>
			{reports.map((report) => (
				<ReportCard report={report} key={report.id} />
			))}

			{/* Pagination footer */}
			<div className="col-span-1 flex flex-col items-center gap-2 md:col-span-3">
				<p className="text-muted-foreground text-sm">
					{startIdx}–{endIdx} von {total} Berichte
				</p>
				{pageCount > 1 && (
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									href={page > 1 ? buildHref(page - 1) : undefined}
									aria-disabled={page <= 1}
									className={cn(page <= 1 && "pointer-events-none opacity-50")}
								/>
							</PaginationItem>

							{getPageNumbers().map((p, idx) =>
								p === "ellipsis" ? (
									<PaginationItem key={`ellipsis-${idx}`}>
										<PaginationEllipsis />
									</PaginationItem>
								) : (
									<PaginationItem key={p}>
										<PaginationLink href={buildHref(p)} isActive={p === page}>
											{p}
										</PaginationLink>
									</PaginationItem>
								),
							)}

							<PaginationItem>
								<PaginationNext
									href={page < pageCount ? buildHref(page + 1) : undefined}
									aria-disabled={page >= pageCount}
									className={cn(page >= pageCount && "pointer-events-none opacity-50")}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				)}
			</div>
		</>
	);
}
