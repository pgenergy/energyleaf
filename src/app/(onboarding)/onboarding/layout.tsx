import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/lib/auth";

export const metadata: Metadata = {
	title: "Onboarding - Energyleaf",
};

interface Props {
	children: React.ReactNode;
}

export default async function OnboardingLayout({ children }: Props) {
	const { user } = await getCurrentSession();

	if (!user) {
		redirect("/login");
	}

	if (user.onboardingCompleted) {
		redirect("/dashboard");
	}

	return <main className="container mx-auto max-w-3xl px-4 py-8">{children}</main>;
}
