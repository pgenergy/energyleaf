import Image from "next/image";
import logo from "../../../public/image/logo/logo.png";
import bg from "../../../public/image/bg/login.png";

import { Card, CardHeader } from "@energyleaf/ui";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex h-screen w-screen flex-col items-center justify-center">
            <div className="w-screen h-screen z-[-1] overflow-hidden fixed inset-0 object-fill">
                <Image
                    alt="Background"
                    fill
                    placeholder="blur"
                    src={bg}
                />
            </div>
            <Card className="w-full max-w-xl">
                <CardHeader>
                    <div className="flex flex-row items-center justify-center gap-2">
                        <Image
                            alt="Energyleaf Logo"
                            className="h-16 w-16"
                            src={logo}
                        />
                        <h1 className="text-4xl">Energyleaf</h1>
                    </div>
                </CardHeader>
                {children}
            </Card>
        </main>
    );
}
