"use client";

import { buttonVariants } from "@energyleaf/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
    href: string;
    children: React.ReactNode;
}

export default function SettingsLink(props: Props) {
    const pathname = usePathname();

    return (
        <Link href={props.href} className={buttonVariants({ variant: pathname === props.href ? "default" : "ghost" })}>
            {props.children}
        </Link>
    );
}
