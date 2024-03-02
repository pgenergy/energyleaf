import Link from "next/link";

import { CardContent, Separator } from "@energyleaf/ui";

export default function AccountCreatedPage() {
    return (
        <CardContent>
            <div className="flex flex-col gap-2">
                <div className="pb-4">
                    <p className="text-xl font-bold">Ihr Konto wurde erstellt.</p>
                    <p className="text-sm text-muted-foreground">
                        Wenn wir Ihren Sensor aktivieren, erhalten Sie eine E-Mail. <br />
                        Mit erhalt der E-Mail können Sie sich einloggen und Ihre Daten einsehen.
                    </p>
                </div>
                <Separator />
                <div className="flex flex-col items-center gap-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                        Noch kein Konto?{" "}
                        <Link className="underline hover:no-underline" href="/">
                            Zurück zum Login
                        </Link>
                    </p>
                </div>
            </div>
        </CardContent>
    );
}
