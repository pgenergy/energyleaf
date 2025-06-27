import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export const metadata = {
	title: "Konto erstellt - Energyleaf",
	robots: "noindex, nofollow",
};

export default function AccountCreatedPage() {
	return (
		<CardContent>
			<div className="flex flex-col gap-2">
				<div className="pb-4">
					<p className="text-xl font-bold">Ihr Konto wurde erstellt.</p>
					<p className="text-muted-foreground text-sm">
						Wenn wir Ihren Sensor aktivieren, erhalten Sie eine E-Mail. <br />
						Mit Erhalt der E-Mail können Sie sich einloggen und Ihre Daten einsehen.
					</p>
				</div>
				<Separator />
				<div className="flex flex-col items-center gap-4 pt-4">
					<p className="text-muted-foreground text-sm">
						<Link className="underline hover:no-underline" href="/">
							Zurück zum Start
						</Link>
					</p>
				</div>
			</div>
		</CardContent>
	);
}
