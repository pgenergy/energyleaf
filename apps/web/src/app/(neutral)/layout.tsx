import Image from "next/image";
import Link from "next/link";
import { DemoBanner } from "@/components/footer/demo-banner";

import logo from "../../../public/image/logo/logo.png";

interface Props {
    children: React.ReactNode;
}

export default function NeutralLayout(props: Props) {
    return (
        <>
            <header className="border-b border-border px-8 py-4">
                <Link href="/" className="flex flex-row items-center gap-2">
                    <Image src={logo} alt="logo" className="h-10 w-10" />
                    <h1 className="text-2xl font-bold">Energyleaf</h1>
                </Link>
            </header>
            <main className="max-w-[75%] mx-auto flex flex-col gap-4 px-8 py-10">{props.children}</main>
            <footer>
                <DemoBanner />
            </footer>
        </>
    );
}
