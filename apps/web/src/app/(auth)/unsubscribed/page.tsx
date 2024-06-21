import { Card, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";

export const metadata = {
    title: "E-Mail Einstellungen aktualisiert | Energyleaf",
    robots: "noindex, nofollow",
};

export default async function Page() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Ihre E-Mail Einstellungen wurden aktualisiert.</CardTitle>
                <CardDescription className="gap-3">Sie können diese Seite nun schließen.</CardDescription>
            </CardHeader>
        </Card>
    );
}
