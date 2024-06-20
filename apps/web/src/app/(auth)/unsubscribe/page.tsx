import UnsubscribeForm from "@/components/auth/unsubscribe-form";
import { createMailSettingsSchema } from "@/lib/schema/conversion/profile";
import { getUserIdByToken, getUserMailConfig } from "@/query/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";

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
                    Hier können Sie ihre E-Mail Einstellungen aktualisieren. Dabei können Sie die Einstellungen für die
                    einzelnen E-Mail Arten konfigurieren. Bei den zyklischen Berichten können Sie auch Sendezeitpunkt
                    sowie Intervall festlegen.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <UnsubscribeForm mailConfig={mailConfig} userId={userId} />
            </CardContent>
        </Card>
    );
}
