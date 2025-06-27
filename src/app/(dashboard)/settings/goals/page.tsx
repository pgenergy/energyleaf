import EnergyGoalCard from "@/components/cards/settings/energy-goals-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentSession } from "@/server/lib/auth";
import { Suspense } from "react";

export default async function GoalsPage() {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	return (
		<div className="flex flex-col gap-4">
			<Suspense fallback={<Skeleton className="h-76" />}>
				<EnergyGoalCard />
			</Suspense>
		</div>
	);
}
