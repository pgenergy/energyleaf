import { Suspense } from "react";
import EnergyTariffCard from "@/components/cards/settings/energy-tariff-card";
import HouseholdSettingsCard from "@/components/cards/settings/household-settings-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentSession } from "@/server/lib/auth";

export default async function SettingsPage() {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	return (
		<div className="flex flex-col gap-4">
			<Suspense fallback={<Skeleton className="h-96" />}>
				<HouseholdSettingsCard />
			</Suspense>
			<Suspense fallback={<Skeleton className="h-96" />}>
				<EnergyTariffCard />
			</Suspense>
		</div>
	);
}
