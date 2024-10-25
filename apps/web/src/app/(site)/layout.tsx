import MobileSidebarButton from "@/components/nav/mobile-nav-button";
import AppSidebar from "@/components/nav/sidebar";
import PageView from "@/components/tracking/page-view";
import { getSession } from "@/lib/auth/auth.server";
import { isDemoUser } from "@/lib/demo/demo";
import { getHandbookUrl } from "@/lib/help/handbook";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { SidebarInset, SidebarProvider } from "@energyleaf/ui/sidebar";
import {
    BadgeInfoIcon,
    DollarSignIcon,
    HomeIcon,
    LampIcon,
    LightbulbIcon,
    MailsIcon,
    SettingsIcon,
    ZapIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type React from "react";

export const metadata = {
    robots: "noindex, nofollow",
};

const navLinks = [
    {
        slug: "dashboard",
        title: "Übersicht",
        path: "/dashboard",
        icon: <HomeIcon />,
    },
    {
        slug: "energy",
        title: "Strom",
        path: "/energy",
        icon: <ZapIcon />,
    },
    {
        slug: "costs",
        title: "Kosten",
        path: "/costs",
        icon: <DollarSignIcon />,
    },
    {
        slug: "devices",
        title: "Geräte",
        path: "/devices",
        icon: <LampIcon />,
        appVersion: Versions.self_reflection,
    },
    {
        slug: "reports",
        title: "Berichte",
        path: "/reports",
        icon: <MailsIcon />,
        appVersion: Versions.support,
    },
    {
        slug: "recommendations",
        title: "Empfehlungen",
        path: "/recommendations",
        icon: <LightbulbIcon />,
        appVersion: Versions.support,
    },
    {
        slug: "faq",
        title: "FAQ",
        path: "/faq",
        icon: <BadgeInfoIcon />,
    },
    {
        slug: "settings",
        title: "Einstellungen",
        path: "/settings",
        icon: <SettingsIcon />,
    },
];

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
    const { session, user } = await getSession();
    if (!session || !user) {
        redirect("/");
    }

    const isDemo = await isDemoUser();
    const filteredNavLinks = navLinks.filter((link) => !link.appVersion || fulfills(user.appVersion, link.appVersion));
    const handbookEndpoint = getHandbookUrl(user.appVersion);

    return (
        <SidebarProvider>
            <PageView />
            <AppSidebar links={filteredNavLinks} user={user} isDemo={isDemo} handbookLink={handbookEndpoint} />
            <SidebarInset>
                <nav className="flex w-full flex-row items-center gap-4 border-border border-b px-2 py-2">
                    <MobileSidebarButton />
                    <Link className="flex flex-row items-center gap-2" href="/dashboard">
                        <Image alt="logo" className="h-10 w-10" height={499} src="/image/logo/logo.png" width={499} />
                        <h1 className="font-bold text-2xl">Energyleaf</h1>
                    </Link>
                </nav>
                <main className="px-8 py-8">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
