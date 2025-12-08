import { GoalIcon, LockKeyholeIcon, MailboxIcon, User2Icon, WrenchIcon } from "lucide-react";
import SettingsLink from "../links/settings-link";

interface Props {
	showSimulation: boolean;
}

export default function SettingsNav(props: Props) {
	return (
		<div className="flex flex-row flex-wrap items-center justify-center gap-4 md:justify-start">
			<SettingsLink href="/settings">
				<User2Icon className="size-4" />
				Profil
			</SettingsLink>
			<SettingsLink href="/settings/goals">
				<GoalIcon className="size-4" />
				Ziele
			</SettingsLink>
			<SettingsLink href="/settings/reports">
				<MailboxIcon className="size-4" />
				Berichte
			</SettingsLink>
			{props.showSimulation ? (
				<SettingsLink href="/settings/simulation">
					<WrenchIcon className="size-4" />
					Simulation
				</SettingsLink>
			) : null}
			<SettingsLink href="/settings/security">
				<LockKeyholeIcon className="size-4" />
				Passwort
			</SettingsLink>
			<SettingsLink href="/settings/account">
				<WrenchIcon className="size-4" />
				Konto
			</SettingsLink>
		</div>
	);
}
