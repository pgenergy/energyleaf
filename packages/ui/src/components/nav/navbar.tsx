import Image from "next/image";
import Link from "next/link";
import MobileSidebar from "./mobile-sidebar";

interface NavLink {
    slug: string;
    title: string;
    path: string;
    icon?: React.ReactNode;
}

interface Props {
    title: string;
    titleLink?: string;
    actions?: React.ReactNode;
    links: NavLink[];
}

export function Navbar({ title, actions, titleLink, links }: Props) {
    return (
        <nav className="fixed top-0 right-0 left-0 z-50 flex w-full flex-row items-center px-8 py-2 backdrop-blur-lg">
            <MobileSidebar links={links} title={title} titleLink={titleLink} />
            <Link className="flex flex-row items-center gap-2" href={titleLink ? titleLink : "/"}>
                <Image alt="logo" className="h-10 w-10" height={499} src="/image/logo/logo.png" width={499} />
                <h1 className="font-bold text-2xl">{title}</h1>
            </Link>
            <div className="flex-1" />
            <div className="flex flex-row items-center gap-4">{actions}</div>
        </nav>
    );
}
