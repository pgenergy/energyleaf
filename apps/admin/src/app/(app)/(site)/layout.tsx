import { redirect } from "next/navigation";
import NavbarAvatar from "@/components/nav/navbar-avatar";
import ThemeSwitcher from "@/components/nav/theme-switcher";
import { getSession } from "@/lib/auth/auth";
import { AreaChartIcon, CpuIcon, HomeIcon, Users2Icon } from "lucide-react";

import { Navbar, Sidebar } from "@energyleaf/ui/components/nav";

interface Props {
    children: React.ReactNode;
}

const navLinks = [
    {
        slug: "dashboard",
        title: "Übersicht",
        path: "/",
        icon: <HomeIcon className="mr-2 h-4 w-4" />,
    },
    {
        slug: "sesnors",
        title: "Sensoren",
        path: "/sensors",
        icon: <CpuIcon className="mr-2 h-4 w-4" />,
    },
    {
        slug: "users",
        title: "Nutzer",
        path: "/users",
        icon: <Users2Icon className="mr-2 h-4 w-4" />,
    },
    {
        slug: "analytics",
        title: "Analytics",
        path: "/analytics",
        icon: <AreaChartIcon className="mr-2 h-4 w-4" />,
    },
];

export default async function SiteLayout({ children }: Props) {
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
                links={navLinks}
                title="Energyleaf Admin"
            />
            <Sidebar links={navLinks} />
            <main className="ml-0 md:ml-[13%] mt-14 px-8 py-8">{children}</main>
        </>
    );
}
