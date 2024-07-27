"use client";

import { type EnergyRangeOptionType, energyRangeOptions } from "@/types/energy";
import { Button, buttonVariants } from "@energyleaf/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
    children: React.ReactNode;
}

export default function RangeNavSelector(props: Props) {
    return (
        <div className="col-span-1 flex flex-row flex-wrap items-center justify-center gap-4 md:col-span-3 md:justify-start">
            {props.children}
        </div>
    );
}

interface RangeLinkProps {
    range: EnergyRangeOptionType;
    href: string;
}

export function RangeNavLink(props: RangeLinkProps) {
    const pathname = usePathname();

    return (
        <Link
            href={props.href}
            className={buttonVariants({
                variant: props.href === pathname ? "default" : "ghost",
            })}
        >
            {energyRangeOptions[props.range]}
        </Link>
    );
}

interface RangeButtonProps {
    href: string;
    children: React.ReactNode;
}

export function RangeNavButton(props: RangeButtonProps) {
    const pathname = usePathname();

    return <Button variant={pathname === props.href ? "default" : "ghost"}>{props.children}</Button>;
}
