import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SensorsOverview } from "@/components/cards/sensor/sensors-overview";
import { SensorSearch } from "@/components/forms/sensor/sensor-search";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentSession } from "@/server/lib/auth";

const PAGE_SIZE = 20;

type SearchParams = Promise<{ page?: string; q?: string }>;

interface Props {
	searchParams: SearchParams;
}

export const metadata: Metadata = {
	title: "Sensoren - Admin - Energyleaf",
};

export default async function AdminSensorsPage(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		redirect("/login");
	}

	if (!user.isAdmin) {
		redirect("/dashboard");
	}

	const searchParams = await props.searchParams;
	const pageNum = Number(searchParams.page) || 1;
	const currentPage = pageNum > 0 ? pageNum : 1;
	const query = searchParams.q?.trim() ?? "";

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div className="col-span-1 flex flex-col items-center justify-between gap-2 md:col-span-2 md:flex-row">
				<h1 className="text-xl font-bold">Sensoren</h1>
				<div className="flex flex-col items-center gap-2 sm:flex-row">
					<SensorSearch />
					<Button asChild>
						<Link href="/admin/sensors/create">
							<PlusIcon className="mr-2 size-4" />
							Neuer Sensor
						</Link>
					</Button>
				</div>
			</div>
			<Suspense fallback={<Skeleton className="col-span-1 h-56 md:col-span-2" />}>
				<SensorsOverview page={currentPage} pageSize={PAGE_SIZE} query={query} />
			</Suspense>
		</div>
	);
}
