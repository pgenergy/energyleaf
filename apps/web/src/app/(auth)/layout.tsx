import Image from "next/image";
import { DemoBanner } from "@/components/footer/demo-banner";

import { Card, CardHeader, buttonVariants } from "@energyleaf/ui";

import bg from "../../../public/image/bg/login.png";
import logo from "../../../public/image/logo/logo.png";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <main className="flex h-screen w-screen flex-col items-center justify-center">
                <div className="fixed inset-0 z-[-1] h-screen w-screen overflow-hidden object-fill">
                    <Image alt="Background" fill placeholder="blur" src={bg} />
                </div>
                <Card className="w-full max-w-xl">
                    <CardHeader>
                        <div className="flex flex-row items-center justify-center gap-2">
                            <Image alt="Energyleaf Logo" className="h-16 w-16" src={logo} />
                            <h1 className="text-4xl">Energyleaf</h1>
                        </div>
                    </CardHeader>
                    {children}
                    <div className="flex flex-row items-center justify-center gap-2">
                        <Link className={buttonVariants({ variant: "link" })} href="/privacy" target="_blank">
                            Datenschutz
                        </Link>
                        <p>|</p>
                        <Link href="/legal" target="_blank" className={buttonVariants({ variant: "link" })}>
                            Impressum
                        </Link>
                    </div>
                </Card>
            </main>
            <footer>
                <DemoBanner />
            </footer>
        </>
    );
}
