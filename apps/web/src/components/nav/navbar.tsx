import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";

import NavbarAvatar from "./navbar-avatar";
import ThemeSwitcher from "./theme-switcher";

export default async function Navbar() {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    return (
        <nav className="fixed left-0 right-0 top-0 z-50 flex w-full flex-row items-center px-8 py-2 backdrop-blur-lg">
            <Link className="flex flex-row items-center gap-2" href="/dashboard">
                <Image alt="logo" className="h-10 w-10" height={499} src="/image/logo/logo.png" width={499} />
                <h1 className="text-2xl font-bold">Energyleaf</h1>
            </Link>
            <div className="flex-1" />
            <div className="flex flex-row items-center gap-4">
                <ThemeSwitcher />
                <NavbarAvatar user={session.user} />
            </div>
        </nav>
    );
}
