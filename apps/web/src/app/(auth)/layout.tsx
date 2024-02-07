import Image from "next/image";

import { Card, CardHeader } from "@energyleaf/ui";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex h-screen w-screen flex-col items-center justify-center bg-[url('/image/bg/login.png')] bg-cover bg-no-repeat">
            <Card className="w-full max-w-xl">
                <CardHeader>
                    <div className="flex flex-row items-center justify-center gap-2">
                        <Image
                            alt="Energyleaf Logo"
                            className="h-16 w-16"
                            height={499}
                            src="/image/logo/logo.png"
                            width={499}
                        />
                        <h1 className="text-4xl">Energyleaf</h1>
                    </div>
                </CardHeader>
                {children}
            </Card>
        </main>
    );
}
