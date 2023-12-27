import Image from "next/image";
import Link from "next/link";

interface Props {
    title: string;
    titleLink?: string;
    actions?: React.ReactNode;
}

export function Navbar({ title, actions, titleLink }: Props) {
    return (
        <nav className="fixed left-0 right-0 top-0 z-50 flex w-full flex-row items-center px-8 py-2 backdrop-blur-lg">
            <Link className="flex flex-row items-center gap-2" href={titleLink ? titleLink : "/"}>
                <Image alt="logo" className="h-10 w-10" height={499} src="/image/logo/logo.png" width={499} />
                <h1 className="text-2xl font-bold">{title}</h1>
            </Link>
            <div className="flex-1" />
            <div className="flex flex-row items-center gap-4">{actions}</div>
        </nav>
    );
}
