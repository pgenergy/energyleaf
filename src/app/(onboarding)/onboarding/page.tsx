import { Suspense } from "react";
import EnergyGoalCard from "@/components/cards/settings/energy-goals-card";
import EnergyTariffCard from "@/components/cards/settings/energy-tariff-card";
import HouseholdSettingsCard from "@/components/cards/settings/household-settings-card";
import OnboardingActions from "@/components/onboarding/onboarding-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentSession } from "@/server/lib/auth";

export default async function OnboardingPage() {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">Willkommen bei Energyleaf</h1>
				<p className="text-muted-foreground">
					Bitte füllen Sie die folgenden Informationen aus, um Energyleaf optimal nutzen zu können. Sie können
					diesen Schritt auch überspringen und die Daten später in den Einstellungen ergänzen.
				</p>
			</div>

			<div className="flex flex-col gap-4">
				<Suspense fallback={<Skeleton className="h-96" />}>
					<HouseholdSettingsCard />
				</Suspense>
				<Suspense fallback={<Skeleton className="h-96" />}>
					<EnergyTariffCard />
				</Suspense>
				<Suspense fallback={<Skeleton className="h-76" />}>
					<EnergyGoalCard />
				</Suspense>
			</div>

			<OnboardingActions />
		</div>
	);
}
