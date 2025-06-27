import LoginForm from "@/components/forms/auth/login-form";
import { env } from "@/env";
import Link from "next/link";

export const metadata = {
	title: "Energyleaf",
    description: "Willkommen bei Energyleaf!",
	robots: "index",
};

export default function LoginPage() {
	const hideForgot = !env.RESEND_API_MAIL || !env.RESEND_API_KEY;

	return (
		<div className="flex flex-col gap-2">
			<p className="text-xl font-bold">Willkommen bei Energyleaf!</p>
			<p className="text-muted-foreground mb-2">Bitte loggen Sie sich ein, um fortzufahren.</p>
			<LoginForm />
			<div className="flex flex-col items-center">
				{env.DISABLE_SIGNUP ? null : (
					<p className="text-muted-foreground pb-6 text-sm">
						Noch kein Konto?{" "}
						<Link className="underline hover:no-underline" href="/signup">
							Konto erstellen
						</Link>
					</p>
				)}
				{!hideForgot ? (
					<p className="text-muted-foreground text-sm">
						<Link className="underline hover:no-underline" href="/forgot">
							Passwort vergessen?
						</Link>
					</p>
				) : null}
			</div>
		</div>
	);
}
