import ChangeAccountInfoCard from "@/components/cards/settings/change-account-info-card";
import ChangeNameCard from "@/components/cards/settings/change-name-card";
import DeleteAccountForm from "@/components/forms/settings/delete-account-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/server/db";
import { userTable } from "@/server/db/tables/user";
import { getCurrentSession } from "@/server/lib/auth";
import { ExperimentMode } from "@/server/lib/check";
import { eq } from "drizzle-orm";
import { Suspense } from "react";

export default async function AccountPage() {
	const { user } = await getCurrentSession();

	if (!user) {
		return null;
	}

	if (user.id === "demo") {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Konto</CardTitle>
				</CardHeader>
				<CardContent>
					<p>Als Demo-Benutzer können Sie Ihr Konto nicht bearbeiten.</p>
				</CardContent>
			</Card>
		);
	}

	const currentData = await db.select().from(userTable).where(eq(userTable.id, user.id)).limit(1);
	if (!currentData || currentData.length !== 1) {
		return null;
	}

	const currentUser = currentData[0];

	return (
		<div className="flex flex-col gap-4">
			<Suspense fallback={<Skeleton className="h-96" />}>
				<ChangeNameCard />
			</Suspense>
			<Card>
				<CardHeader>
					<CardTitle>E-Mail</CardTitle>
					<CardDescription>E-Mail kann derzeit nicht geändert werden</CardDescription>
				</CardHeader>
				<CardContent>
					<Input disabled={true} value={currentUser.email} />
				</CardContent>
			</Card>
			<Suspense fallback={<Skeleton className="h-96" />}>
				<ChangeAccountInfoCard />
			</Suspense>
			<Card className="border-destructive border">
				<CardHeader>
					<CardTitle>Konto löschen</CardTitle>
					<CardDescription>Ihr Konto löschen</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{ExperimentMode() ? (
						<p>
							Konto löschen?
							<br />
							Da Sie aktiv an einem Experiment teilnehmen, werden Ihre Daten verwendet, um wertvolle
							Erkenntnisse für die Forschung zu gewinnen. Wenn Sie Ihre Teilnahme beenden und Ihre Daten
							anonymisieren lassen möchten, sodass sie nicht mehr mit Ihrem Konto in Verbindung gebracht
							werden können, senden Sie uns bitte eine E-Mail. Wir werden uns dann umgehend darum kümmern.
						</p>
					) : (
						<>
							<p>
								Sind sie sicher, dass sie Ihr Konto löschen möchten?
								<br />
								Sie haben danach keine Möglichkeit mehr auf Ihr Konto zuzugreifen. Mit dem löschen,
								werden alle Ihre Daten endgültig gelöscht. Dies kann nicht rückgängig gemacht werden!
							</p>
							<DeleteAccountForm />
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
