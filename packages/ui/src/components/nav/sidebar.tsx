"use client";

import { ScrollArea } from "@radix-ui/react-scroll-area";
import { default as clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
        <nav className="fixed top-14 left-0 hidden w-[13%] md:flex">
            <ScrollArea className="- 3.5rem)] flex max-h-[calc(100vh w-full flex-col gap-4 py-8">
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
            </ScrollArea>
        </nav>
    );
}
