import ReportConfigForm from "@/components/forms/settings/report-config-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/server/lib/auth";
import { getReportConfig } from "@/server/queries/reports";

export default async function ReportSettingsCard() {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const config = await getReportConfig(user.id);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Berichteinstellungen</CardTitle>
				<CardDescription>Einstellungen zu Ihren Berichten</CardDescription>
			</CardHeader>
			<CardContent>
				<ReportConfigForm
					initialValues={{
						active: config?.reports || false,
						days: config?.days || [],
					}}
				/>
			</CardContent>
		</Card>
	);
}
