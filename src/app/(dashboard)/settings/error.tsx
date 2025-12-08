"use client";

import { ErrorCard } from "@/components/error/error-card";
import SettingsNav from "@/components/nav/settings-nav";

export default function SettingsErrorPage() {
	return (
		<div className="flex flex-col gap-4 md:gap-8">
			<SettingsNav showSimulation={false} />
			<div className="flex flex-col gap-4">
				<ErrorCard title="Fehler" />
			</div>
		</div>
	);
}
