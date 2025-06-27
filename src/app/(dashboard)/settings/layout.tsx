import SettingsNav from "@/components/nav/settings-nav";
import { getCurrentSession } from "@/server/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
	title: "Einstellungen | Energyleaf",
};

interface Props {
	children: React.ReactNode;
}

export default async function SettingsPage({ children }: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		redirect("/");
	}

	return (
		<div className="flex flex-col gap-4 md:gap-8">
			<SettingsNav />
			<div className="flex flex-col gap-4">{children}</div>
		</div>
	);
}
