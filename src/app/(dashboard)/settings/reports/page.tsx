import AnomalieSettingsCard from "@/components/cards/settings/anomolie-settings-card";
import ReportSettingsCard from "@/components/cards/settings/report-settings-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentSession } from "@/server/lib/auth";
import { Suspense } from "react";

export default async function ReportSettingsPage() {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	if (user.id === "demo") {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Berichte</CardTitle>
				</CardHeader>
				<CardContent>
					<p>Als Demo-Benutzer erhalten Sie keine Berichte.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<Suspense fallback={<Skeleton className="h-96" />}>
				<ReportSettingsCard />
			</Suspense>
			<Suspense fallback={<Skeleton className="h-96" />}>
				<AnomalieSettingsCard />
			</Suspense>
		</div>
	);
}
