import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminCronConfigCard from "@/components/cards/admin/cron-config-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentSession } from "@/server/lib/auth";

export const metadata: Metadata = {
	title: "Allgemein - Admin Einstellungen - Energyleaf",
};

export default async function AdminGeneralSettingsPage() {
	const { user } = await getCurrentSession();
	if (!user || !user.isAdmin) {
		redirect("/");
	}

	return (
		<div className="flex flex-col gap-4">
			<Suspense fallback={<Skeleton className="h-64" />}>
				<AdminCronConfigCard />
			</Suspense>
		</div>
	);
}
