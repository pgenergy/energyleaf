import { redirect } from "next/navigation";
import { DemoBanner } from "@/components/footer/demo-banner";
import Footer from "@/components/footer/footer";
import NavbarAvatar from "@/components/nav/navbar-avatar";
import ThemeSwitcher from "@/components/nav/theme-switcher";
import { getSession } from "@/lib/auth/auth";
import { isDemoUser } from "@/lib/demo/demo";
import { HomeIcon, LightbulbIcon, MicrowaveIcon, AreaChartIcon } from "lucide-react";

import { Navbar, Sidebar } from "@energyleaf/ui/components/nav";

const navLinks = [
    {
        slug: "dashboard",
        title: "Übersicht",
        path: "/dashboard",
        icon: <HomeIcon className="mr-2 h-4 w-4" />,
    },
    {
        slug: "recommendations",
        title: "Empfehlungen",
        path: "/recommendations",
        icon: <LightbulbIcon className="mr-2 h-4 w-4" />,
    },
    {
        slug: "report",
        title: "Berichte",
        path: "/report",
        icon: <AreaChartIcon className="mr-2 h-4 w-4" />,
    },
    {
        slug: "devices",
        title: "Geräte",
        path: "/devices",
        icon: <MicrowaveIcon className="mr-2 h-4 w-4" />,
    },
];

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    const isDemo = await isDemoUser();

    return (
        <>
            <Navbar
                actions={
                    <>
                        <ThemeSwitcher />
                        <NavbarAvatar user={session.user} />
                    </>
                }
                links={navLinks}
                title="Energyleaf"
                titleLink="/dashboard"
            />
            <Sidebar links={navLinks} />
            <main className="ml-0 mt-14 px-8 py-8 md:ml-[13%]">{children}</main>
            {isDemo ? <DemoBanner /> : null}
            <Footer />
        </>
    );
}
