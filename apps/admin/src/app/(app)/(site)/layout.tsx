import MobileSidebarButton from "@/components/nav/mobile-nav-button";
import AppSidebar from "@/components/nav/sidebar";
import { getSession } from "@/lib/auth/auth.server";
import { SidebarInset, SidebarProvider } from "@energyleaf/ui/sidebar";
import { CpuIcon, HomeIcon, Users2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
        <SidebarProvider>
            <AppSidebar links={navLinks} user={user} />
            <SidebarInset>
                <nav className="flex w-full flex-row items-center gap-4 border-border border-b px-2 py-2">
                    <MobileSidebarButton />
                    <Link className="flex flex-row items-center gap-2" href="/dashboard">
                        <Image alt="logo" className="h-10 w-10" height={499} src="/image/logo/logo.png" width={499} />
                        <h1 className="font-bold text-2xl">Energyleaf Admin</h1>
                    </Link>
                </nav>
                <main className="px-8 py-8">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
