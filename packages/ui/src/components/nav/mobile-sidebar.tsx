"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { PanelRightCloseIcon } from "lucide-react";

import { cn } from "@energyleaf/tailwindcss/utils";

import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../ui";

interface NavLink {
    slug: string;
    title: string;
    path: string;
    icon?: React.ReactNode;
}

interface Props {
    title: string;
    titleLink?: string;
    links: NavLink[];
}

export default function MobileSidebar({ title, titleLink, links }: Props) {
    const [open, setOpen] = useState(false);
    return (
        <Sheet onOpenChange={setOpen} open={open}>
            <SheetTrigger asChild>
                <Button className="mr-4 block md:hidden" variant="ghost">
                    <PanelRightCloseIcon className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent className="pr-0" side="left">
                <SheetHeader>
                    <SheetTitle>
                        <Link className="flex flex-row items-center gap-2" href={titleLink ? titleLink : "/"}>
                            <Image
                                alt="logo"
                                className="h-10 w-10"
                                height={499}
                                src="/image/logo/logo.png"
                                width={499}
                            />
                            <h1 className="text-2xl font-bold">{title}</h1>
                        </Link>
                    </SheetTitle>
                </SheetHeader>
                <ScrollArea className="my-4 flex h-[calc(100vh-8rem)] flex-col gap-8 pb-10 px-4">
                    {links.map((link) => (
                        <NavLink
                            className="flex flex-row items-center gap-2 py-2 px-4"
                            key={link.slug}
                            link={link}
                            onOpenChange={setOpen}
                        >
                            {link.icon ?? null}
                            {link.title}
                        </NavLink>
                    ))}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}

interface NavLinkProps {
    link: NavLink;
    onOpenChange?: (open: boolean) => void;
    className?: string;
    children?: React.ReactNode;
}

function NavLink({ link, onOpenChange, className, children }: NavLinkProps) {
    const router = useRouter();
    const pathName = usePathname();
    return (
        <Link
            className={cn(
                {
                    "rounded-full bg-primary text-primary-foreground": pathName === link.path,
                },
                className,
            )}
            href={link.path}
            onClick={() => {
                router.push(link.path);
                onOpenChange?.(false);
            }}
        >
            {children}
        </Link>
    );
}
