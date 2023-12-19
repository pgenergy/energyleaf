import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export default function NotFound() {
    return (
        <main className="flex h-screen w-screen flex-col items-center justify-center gap-4">
            <Link className="flex flex-row items-center gap-2" href="/">
                <Image alt="logo" className="h-10 w-10" height={499} src="/image/logo/logo.png" width={499} />
                <h1 className="text-2xl font-bold">Energyleaf</h1>
            </Link>
            <h1 className="text-lg">Seite nicht gefunden</h1>
            <Link className="flex flex-row items-center gap-2 text-sm text-muted-foreground" href="/">
                <ArrowLeftIcon className="h-2 w-2" />
                Zurück zur Startseite
            </Link>
        </main>
    );
}
