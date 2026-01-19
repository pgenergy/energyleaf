"use client";

import { CarIcon, FlaskConicalIcon, HomeIcon, LightbulbIcon, UserIcon, ZapIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";

interface Props {
	userId: string;
	showExperiment?: boolean;
}

interface Section {
	label: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	show?: boolean;
}

export default function AdminUserEditNav({ userId, showExperiment = true }: Props) {
	const pathname = usePathname();
	const sections: Section[] = [
		{
			label: "Profil",
			href: `/admin/users/${userId}/edit/profile`,
			icon: UserIcon,
		},
		{
			label: "Haushalt",
			href: `/admin/users/${userId}/edit/household`,
			icon: HomeIcon,
		},
		{
			label: "Tarif",
			href: `/admin/users/${userId}/edit/tariff`,
			icon: ZapIcon,
		},
		{
			label: "Hinweise",
			href: `/admin/users/${userId}/edit/status`,
			icon: LightbulbIcon,
			show: showExperiment,
		},
		{
			label: "Simulationen",
			href: `/admin/users/${userId}/edit/simulations`,
			icon: CarIcon,
		},
		{
			label: "Experiment",
			href: `/admin/users/${userId}/edit/experiment`,
			icon: FlaskConicalIcon,
			show: showExperiment,
		},
	];

	return (
		<nav className="flex flex-row flex-wrap items-center justify-center gap-2 md:justify-start">
			{sections
				.filter((section) => section.show !== false)
				.map((section) => {
					const Icon = section.icon;
					return (
						<Link
							key={section.href}
							href={section.href}
							className={buttonVariants({
								variant: pathname === section.href ? "default" : "ghost",
								size: "sm",
							})}
						>
							<Icon className="mr-1 size-4" />
							{section.label}
						</Link>
					);
				})}
		</nav>
	);
}
