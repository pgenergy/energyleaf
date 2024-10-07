import NavbarAvatar from "@/components/nav/navbar-avatar";
import ThemeSwitcher from "@/components/nav/theme-switcher";
import { getSession } from "@/lib/auth/auth.server";
import { Navbar } from "@energyleaf/ui/nav/navbar";
import { Sidebar } from "@energyleaf/ui/nav/sidebar";
import { CpuIcon, HomeIcon, Users2Icon } from "lucide-react";
import { redirect } from "next/navigation";

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
        slug: "users",
        title: "Nutzer",
        path: "/users",
        icon: <Users2Icon className="mr-2 h-4 w-4" />,
    },
    {
        slug: "sensors",
        title: "Sensoren",
        path: "/sensors",
        icon: <CpuIcon className="mr-2 h-4 w-4" />,
    },
];

export default async function SiteLayout({ children }: Props) {
    const { session, user } = await getSession();

    if (!session || !user || !user.isAdmin) {
        redirect("/auth");
    }

    return (
        <>
            <Navbar
                actions={
                    <>
                        <ThemeSwitcher />
                        <NavbarAvatar user={user} />
                    </>
                }
                links={navLinks}
                title="Energyleaf Admin"
            />
            <Sidebar links={navLinks} />
            <main className="mt-14 ml-0 px-8 py-8 md:ml-[13%]">{children}</main>
        </>
    );
}
