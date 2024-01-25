"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { default as clsx } from "clsx";

interface NavLink {
    slug: string;
    title: string;
    path: string;
    icon?: React.ReactNode;
}

interface Props {
    links: NavLink[];
}

export function Sidebar({ links }: Props) {
    const pathname = usePathname();

    function isSelected(link: NavLink) {
        return (link.path !== "/" && pathname.startsWith(link.path)) || pathname === link.path;
    }

    return (
        <nav className="max-h-[calc(100vh - 3.5rem)] fixed left-0 top-14 hidden w-[13%] flex-col gap-4 overflow-scroll py-8 md:flex">
            {links.map((link) => (
                <Link
                    className={clsx(
                        {
                            "hover:bg-accent": !isSelected(link),
                            "bg-primary text-primary-foreground": isSelected(link),
                        },
                        "flex flex-row items-center rounded-r-full px-4 py-2 font-medium",
                    )}
                    href={link.path}
                    key={link.slug}
                >
                    {link.icon ?? null}
                    {link.title}
                </Link>
            ))}
        </nav>
    );
}
