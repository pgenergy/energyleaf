import UnsubscribeForm from "@/components/auth/unsubscribe-form";
import { createMailSettingsSchema } from "@/lib/schema/conversion/profile";
import { reportMailSettingsSchema } from "@/lib/schema/profile";
import { getUserData, getUserIdByToken, getUserMailConfig } from "@/query/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import { useSearchParams } from "next/navigation";

export const metadata = {
    title: "E-Mail Einstellungen bearbeiten | Energyleaf",
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

    const mailSettings = await getUserMailConfig(userId);
    const mailConfig = createMailSettingsSchema(mailSettings);

    return (
        <Card>
            <CardHeader>
                <CardTitle>E-Mail Einstellungen aktualisieren</CardTitle>
                <CardDescription>
                    Hier können Sie einstellen, ob und in welchem Intervall die für Sie erstellen Berichte über Ihren
                    Verbrauch erstellt werden sollen. Sie können sich hierbei von den E-Mail Benachrichtigungen
                    abmelden.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <UnsubscribeForm mailConfig={mailConfig} userId={userId} />
            </CardContent>
        </Card>
    );
}
