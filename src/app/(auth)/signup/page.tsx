import SignUpExperimentForm from "@/components/forms/auth/signup-experiment-form";
import SignUpForm from "@/components/forms/auth/signup-form";
import { env } from "@/env";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
	title: "Konto erstellen - Energyleaf",
	robots: "noindex, nofollow",
};

export default function SignupPage() {
	if (env.DISABLE_SIGNUP) {
		redirect("/");
	}

	return (
		<div className="flex flex-col gap-2">
			<p className="text-xl font-bold">Das Abenteuer beginnt hier!</p>
			<p className="text-muted-foreground mb-2">Verständnis über den eigenen Energieverbrauch aufbauen.</p>
			{env.DISABLE_EXPERIMENT ? <SignUpForm /> : <SignUpExperimentForm />}
			<div className="flex flex-col items-center gap-4">
				<p className="text-muted-foreground text-sm">
					Sie haben bereits ein Konto?{" "}
					<Link className="underline hover:no-underline" href="/">
						Anmelden
					</Link>
				</p>
			</div>
		</div>
	);
}
