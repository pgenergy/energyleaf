import { ClockIcon, SettingsIcon, WrenchIcon } from "lucide-react";
import SettingsLink from "../links/settings-link";

export default function AdminSettingsNav() {
	return (
		<div className="flex flex-row flex-wrap items-center justify-center gap-4 md:justify-start">
			<SettingsLink href="/admin/settings/general">
				<SettingsIcon className="size-4" />
				Allgemein
			</SettingsLink>
			<SettingsLink href="/admin/settings/tou-templates">
				<ClockIcon className="size-4" />
				TOU-Tarif Vorlagen
			</SettingsLink>
			<SettingsLink href="/admin/settings/simulation">
				<WrenchIcon className="size-4" />
				Simulation
			</SettingsLink>
		</div>
	);
}
