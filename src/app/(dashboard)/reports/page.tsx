import { SettingsIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ReportsOverview } from "@/components/cards/report/reports-overview";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentSession } from "@/server/lib/auth";

const PAGE_SIZE = 10;

type SearchParams = Promise<{ page?: string }>;

interface Props {
	searchParams: SearchParams;
}

export const metadata: Metadata = {
	title: "Berichte - Energyleaf",
};

export default async function ReportsPage(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const searchParams = await props.searchParams;
	const pageNum = Number(searchParams.page) || 1;
	const currentPage = pageNum > 0 ? pageNum : 1;

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div className="col-span-1 flex flex-col items-center justify-between gap-2 md:col-span-3 md:flex-row">
				<h1 className="text-xl font-bold">Berichte</h1>
				<Link href="/settings/reports" className={buttonVariants({ variant: "outline", size: "sm" })}>
					<SettingsIcon className="mr-2 h-4 w-4" />
					Einstellungen
				</Link>
			</div>
			<Suspense fallback={<Skeleton className="col-span-1 h-56 md:col-span-3" />}>
				<ReportsOverview page={currentPage} pageSize={PAGE_SIZE} />
			</Suspense>
		</div>
	);
}
