import {
	BarChartIcon,
	CpuIcon,
	DollarSignIcon,
	FileTextIcon,
	HomeIcon,
	LampIcon,
	PlayCircleIcon,
	SettingsIcon,
	Users2Icon,
	ZapIcon,
} from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AppSidebar from "@/components/nav/app-sidebar";
import NavButton from "@/components/nav/nav-button";
import PageViewTracker from "@/components/tracking/page-view-tracker";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { env } from "@/env";
import { genID } from "@/lib/utils";
import { getCurrentSession } from "@/server/lib/auth";
import { getEnabledSimulations } from "@/server/queries/simulations";

interface Props {
	children: React.ReactNode;
}

export default async function DashboardLayout(props: Props) {
	const { user } = await getCurrentSession();

	if (!user) {
		redirect("/login");
	}

	if (!user.onboardingCompleted) {
		redirect("/onboarding");
	}

	if (!env.DISABLE_TRACKING) {
		const cookieStore = await cookies();
		const session = cookieStore.get("s_id");
		let sessionValue = "";

		if (!session) {
			sessionValue = genID(20);
			cookieStore.set("s_id", sessionValue, {
				path: "/",
				sameSite: "lax",
				httpOnly: true,
				secure: env.VERCEL === "production",
			});
		} else {
			sessionValue = session.value;
		}
	}

	const navLinks = [
		{
			slug: "dashboard",
			title: "Übersicht",
			path: "/dashboard",
			icon: <HomeIcon />,
			admin: false,
		},
		{
			slug: "energy",
			title: "Strom",
			path: "/energy",
			icon: <ZapIcon />,
			admin: false,
		},
		{
			slug: "peaks",
			title: "Ausschläge",
			path: "/peaks",
			icon: <BarChartIcon />,
			admin: false,
		},
		{
			slug: "costs",
			title: "Kosten",
			path: "/cost",
			icon: <DollarSignIcon />,
			admin: false,
		},
		{
			slug: "devices",
			title: "Geräte",
			path: "/devices",
			icon: <LampIcon />,
			admin: false,
		},
		{
			slug: "reports",
			title: "Berichte",
			path: "/reports",
			icon: <FileTextIcon />,
			admin: false,
		},
	];

	// Check if user should see simulation page
	const enabledSimulations = await getEnabledSimulations(user.id);
	const hasAnyEnabledSimulation = !!(
		enabledSimulations.ev ||
		enabledSimulations.solar ||
		enabledSimulations.heatpump ||
		enabledSimulations.battery
	);

	if (user.isSimulationFree || hasAnyEnabledSimulation) {
		navLinks.push({
			slug: "simulation",
			title: "Simulation",
			path: "/simulation",
			icon: <PlayCircleIcon />,
			admin: false,
		});
	}

	navLinks.push({
		slug: "settings",
		title: "Einstellungen",
		path: "/settings",
		icon: <SettingsIcon />,
		admin: false,
	});

	if (user.isAdmin) {
		navLinks.push({
			slug: "admin-settings",
			title: "Einstellungen",
			path: "/admin/settings",
			icon: <SettingsIcon />,
			admin: true,
		});
		navLinks.push({
			slug: "sensors",
			title: "Sensoren",
			path: "/admin/sensors",
			icon: <CpuIcon />,
			admin: true,
		});
		navLinks.push({
			slug: "users",
			title: "Nutzer",
			path: "/admin/users",
			icon: <Users2Icon />,
			admin: true,
		});
	}

	return (
		<SidebarProvider>
			<AppSidebar userId={user.id} items={navLinks} />
			<SidebarInset>
				<header className="bg-background border-border flex w-full flex-row items-center gap-4 border-b px-4 py-2 md:hidden">
					<NavButton />
				</header>
				<main className="px-8 py-8">{props.children}</main>
			</SidebarInset>
			{!env.DISABLE_TRACKING ? <PageViewTracker /> : null}
		</SidebarProvider>
	);
}
