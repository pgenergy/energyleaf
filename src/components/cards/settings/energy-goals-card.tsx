import Link from "next/link";
import EnergyGoalForm from "@/components/forms/settings/energy-goals-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/server/lib/auth";
import { getUserData } from "@/server/queries/user";

export default async function EnergyGoalCard() {
	const { user } = await getCurrentSession();

	if (!user) {
		return null;
	}

	const data = await getUserData(user.id);
	if (!data) {
		return null;
	}

	if (!data.workingPrice || !data.basePrice) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Energiekosten</CardTitle>
					<CardDescription>Passen sie Ihre Ziele zu Ihren Energiekosten an.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center">
						<p>Bitte füllen Sie die fehlenden Daten zu Arbeitspreis und Grundpreis in Ihrem Profil aus</p>
						{user.onboardingCompleted ? (
							<Link className={buttonVariants({ variant: "default" })} href="/settings">
								Zu den Einstellungen
							</Link>
						) : null}
					</div>
				</CardContent>
			</Card>
		);
	}

	const cost = data.consumptionGoal
		? Math.round((data.consumptionGoal * data.workingPrice + data.basePrice) * 100) / 100
		: 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Energiekosten</CardTitle>
				<CardDescription>Passen sie Ihre Ziele zu Ihren Energiekosten an.</CardDescription>
			</CardHeader>
			<CardContent>
				<EnergyGoalForm
					initialValues={{
						energy: data.consumptionGoal || 0,
						cost,
					}}
				/>
			</CardContent>
		</Card>
	);
}
