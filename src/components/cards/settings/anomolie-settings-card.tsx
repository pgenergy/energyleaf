import AnomalyForm from "@/components/forms/settings/anomaly-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/server/lib/auth";
import { getReportConfig } from "@/server/queries/reports";

export default async function AnomalieSettingsCard() {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const config = await getReportConfig(user.id);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Anomalieerkennung</CardTitle>
				<CardDescription>Einstellungen zur Anomalieerkennung</CardDescription>
			</CardHeader>
			<CardContent>
				<AnomalyForm
					initialValues={{
						active: config?.anomaly || false,
					}}
				/>
			</CardContent>
		</Card>
	);
}
