"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { default as clsx } from "clsx";
import { HomeIcon, LightbulbIcon, MicrowaveIcon } from "lucide-react";

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
        icon: <MicrowaveIcon className="mr-2 h-4 w-4" />
    }
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <nav className="max-h-[calc(100vh - 3.5rem)] fixed left-0 top-14 flex w-[13%] flex-col gap-4 overflow-scroll py-8">
            {navLinks.map((link) => (
                <Link
                    className={clsx(
                        {
                            "hover:bg-accent": pathname !== link.path,
                            "bg-primary text-primary-foreground": pathname === link.path,
                        },
                        "flex flex-row items-center rounded-r-full px-4 py-2 font-medium",
                    )}
                    href={link.path}
                    key={link.slug}
                >
                    {link.icon}
                    {link.title}
                </Link>
            ))}
        </nav>
    );
}
