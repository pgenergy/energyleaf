import UnsubscribeForm from "@/components/auth/unsubscribe-form";
import { getUserData, getUserIdByToken } from "@/query/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";

export const metadata = {
    title: "Report Einstellungen bearbeiten | Energyleaf",
    robots: "noindex, nofollow",
};

export interface UnsubscribeFormProps {
    searchParams?: { token: string | undefined };
}

export default async function Page({ searchParams }: UnsubscribeFormProps) {
    const token = searchParams?.token;
    const userId: string | null = token ? await getUserIdByToken(token) : null;

    if (!userId) {
        return (
            <CardContent>
                <div className="flex flex-col gap-2">
                    <p className="font-bold text-xl">Ungültiges oder abgelaufenes Token.</p>
                </div>
            </CardContent>
        );
    }

    const userData = await getUserData(userId);
    const reportConfig = {
        receiveMails: userData?.report_config.receiveMails ?? true,
        interval: userData?.report_config.interval ?? 3,
        time: userData?.report_config.time ?? 6,
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Report Einstellungen aktualisieren</CardTitle>
                <CardDescription>
                    Hier können Sie einstellen, ob und in welchem Intervall die für Sie erstellen Berichte über Ihren
                    Verbrauch erstellt werden sollen. Sollten Sie die Berichte deaktivieren wollen, deaktivieren Sie
                    einfach die Einstellung "Senden der Berichte als E-Mails".
                </CardDescription>
            </CardHeader>
            <CardContent>
                <UnsubscribeForm reportConfig={reportConfig} userId={userId} />
            </CardContent>
        </Card>
    );
}
