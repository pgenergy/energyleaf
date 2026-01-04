import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminSettingsNav from "@/components/nav/admin-settings-nav";
import { getCurrentSession } from "@/server/lib/auth";

export const metadata: Metadata = {
	title: "Einstellungen - Admin - Energyleaf",
};

interface Props {
	children: React.ReactNode;
}

export default async function AdminSettingsLayout({ children }: Props) {
	const { user } = await getCurrentSession();
	if (!user || !user.isAdmin) {
		redirect("/dashboard");
	}

	return (
		<div className="flex flex-col gap-4 md:gap-8">
			<AdminSettingsNav />
			<div className="flex flex-col gap-4">{children}</div>
		</div>
	);
}
