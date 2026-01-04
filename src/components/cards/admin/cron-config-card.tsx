import AdminCronConfigForm from "@/components/forms/admin/admin-cron-config-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCronConfig } from "@/server/queries/config";

export default async function AdminCronConfigCard() {
	const { baseUrl, secretKey } = await getCronConfig();
	const hasExistingSecretKey = secretKey !== null && secretKey.length > 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Cron-Konfiguration</CardTitle>
				<CardDescription>
					Konfigurieren Sie die Einstellungen für die PostgreSQL Cron-Jobs, die die API-Endpunkte aufrufen.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<AdminCronConfigForm initialBaseUrl={baseUrl ?? ""} hasExistingSecretKey={hasExistingSecretKey} />
			</CardContent>
		</Card>
	);
}
