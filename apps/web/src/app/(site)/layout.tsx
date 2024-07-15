import DemoBanner from "@/components/footer/demo-banner";
import Footer from "@/components/footer/footer";
import NavbarAvatar from "@/components/nav/navbar-avatar";
import ThemeSwitcher from "@/components/nav/theme-switcher";
import PageView from "@/components/tracking/page-view";
import { getSession } from "@/lib/auth/auth.server";
import { isDemoUser } from "@/lib/demo/demo";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { Navbar } from "@energyleaf/ui/nav/navbar";
import { Sidebar } from "@energyleaf/ui/nav/sidebar";
import { HomeIcon, MicrowaveIcon, SettingsIcon, HousePlugIcon, DollarSignIcon } from "lucide-react";
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
        icon: <HomeIcon className="mr-2 h-4 w-4" />,
    },
    // {
    //     slug: "recommendations",
    //     title: "Empfehlungen",
    //     path: "/recommendations",
    //     icon: <LightbulbIcon className="mr-2 h-4 w-4" />,
    //     appVersion: Versions.support,
    // },
    // {
    //     slug: "report",
    //     title: "Berichte",
    //     path: "/report",
    //     icon: <AreaChartIcon className="mr-2 h-4 w-4" />,
    //     appVersion: Versions.support, // TODO: Remove this line when the page is ready (PGE-101)
    // },
    {
        slug: "energy",
        title: "Strom",
        path: "/energy",
        icon: <HousePlugIcon className="mr-2 h-4 w-4" />,
    },
    {
        slug: "devices",
        title: "Geräte",
        path: "/devices",
        icon: <MicrowaveIcon className="mr-2 h-4 w-4" />,
        appVersion: Versions.self_reflection,
    },
    {
        slug: "costs",
        title: "Kosten",
        path: "/costs",
        icon: <DollarSignIcon className="mr-2 h-4 w-4" />,
    },
    {
        slug: "settings",
        title: "Einstellungen",
        path: "/settings",
        icon: <SettingsIcon className="mr-2 h-4 w-4" />,
    },
];

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
    const { user } = await getSession();

    if (!user) {
        redirect("/");
    }

    const isDemo = await isDemoUser();

    const filteredNavLinks = navLinks.filter((link) => !link.appVersion || fulfills(user.appVersion, link.appVersion));

    return (
        <>
            <Navbar
                actions={
                    <>
                        <ThemeSwitcher />
                        <NavbarAvatar user={{ ...user, phone: user.phone || null }} />
                    </>
                }
                links={filteredNavLinks}
                title="Energyleaf"
                titleLink="/dashboard"
            />
            <Sidebar links={filteredNavLinks} />
            <PageView />
            <main className="mt-14 ml-0 px-8 py-8 md:ml-[13%]">{children}</main>
            <Footer />
            {isDemo ? <DemoBanner /> : null}
        </>
    );
}
