import { redirect } from "next/navigation";
import Footer from "@/components/footer/footer";
import NavbarAvatar from "@/components/nav/navbar-avatar";
import ThemeSwitcher from "@/components/nav/theme-switcher";
import { getSession } from "@/lib/auth/auth";
import { HomeIcon, LightbulbIcon, MicrowaveIcon } from "lucide-react";

import { Navbar, Sidebar } from "@energyleaf/ui/components";

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
    return (
        <>
            <Navbar
                actions={
                    <>
                        <ThemeSwitcher />
                        <NavbarAvatar user={session.user} />
                    </>
                }
                title="Energyleaf"
            />
            <Sidebar links={navLinks} />
            <main className="ml-[13%] mt-14 px-8 py-8">{children}</main>
            <Footer />
        </>
    );
}
