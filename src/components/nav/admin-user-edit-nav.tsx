"use client";

import {
	BatteryIcon,
	CarIcon,
	ClockIcon,
	HomeIcon,
	KeyIcon,
	PhoneIcon,
	SunIcon,
	ThermometerIcon,
	UserIcon,
	ZapIcon,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface Section {
	id: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}

const sections: Section[] = [
	{ id: "name", label: "Name", icon: UserIcon },
	{ id: "contact", label: "Kontakt", icon: PhoneIcon },
	{ id: "household", label: "Haushalt", icon: HomeIcon },
	{ id: "energy", label: "Energie", icon: ZapIcon },
	{ id: "status", label: "Status", icon: KeyIcon },
	{ id: "simulation-ev", label: "E-Auto", icon: CarIcon },
	{ id: "simulation-solar", label: "Solar", icon: SunIcon },
	{ id: "simulation-heatpump", label: "Wärmepumpe", icon: ThermometerIcon },
	{ id: "simulation-battery", label: "Batterie", icon: BatteryIcon },
	{ id: "simulation-tou", label: "TOU-Tarif", icon: ClockIcon },
];

export default function AdminUserEditNav() {
	return (
		<nav className="flex flex-row flex-wrap items-center justify-center gap-2 md:justify-start">
			{sections.map((section) => {
				const Icon = section.icon;
				return (
					<Link
						key={section.id}
						href={`#${section.id}`}
						className={buttonVariants({ variant: "ghost", size: "sm" })}
						onClick={(e) => {
							e.preventDefault();
							const element = document.getElementById(section.id);
							if (element) {
								element.scrollIntoView({ behavior: "smooth", block: "start" });
							}
						}}
					>
						<Icon className="mr-1 size-4" />
						{section.label}
					</Link>
				);
			})}
		</nav>
	);
}
