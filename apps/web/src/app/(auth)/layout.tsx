import { getSession } from "@/lib/auth/auth.server";
import { buttonVariants } from "@energyleaf/ui/button";
import { Card, CardHeader } from "@energyleaf/ui/card";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import bg from "../../../public/image/bg/login.png";
import logo from "../../../public/image/logo/logo.png";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const { session } = await getSession();

    if (session) {
        redirect("/dashboard");
    }

    return (
        <>
            <main className="flex w-screen flex-col justify-center">
                <div className="fixed inset-0 z-[-1] h-screen w-screen overflow-hidden object-fill">
                    <Image alt="Background" fill placeholder="blur" src={bg} />
                </div>
                <div className="flex w-full flex-col items-center px-4 py-4">
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
                </div>
            </main>
        </>
    );
}
