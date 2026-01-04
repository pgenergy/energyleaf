import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { TouTemplatesOverview } from "@/components/cards/admin/tou-templates-overview";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
	title: "TOU-Tarif Vorlagen - Admin Einstellungen - Energyleaf",
};

export default function TouTemplatesPage() {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<h1 className="font-bold text-2xl">TOU-Tarif Vorlagen</h1>
				<Button asChild className="cursor-pointer">
					<Link href="/admin/settings/tou-templates/new">
						<PlusIcon className="mr-2 size-4" />
						Neue Vorlage
					</Link>
				</Button>
			</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<Suspense
					fallback={
						<>
							<Skeleton className="h-48" />
							<Skeleton className="h-48" />
						</>
					}
				>
					<TouTemplatesOverview />
				</Suspense>
			</div>
		</div>
	);
}
