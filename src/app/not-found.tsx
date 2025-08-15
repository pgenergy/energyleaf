import { ArrowLeftIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo.png";

export default function NotFound() {
	return (
		<main className="flex h-screen w-screen flex-col items-center justify-center gap-4">
			<Link className="flex flex-row items-center gap-2" href="/">
				<Image alt="logo" className="size-10" src={logo} />
				<h1 className="text-2xl font-bold">Energyleaf</h1>
			</Link>
			<h1 className="text-lg">Seite nicht gefunden</h1>
			<Link className="text-muted-foreground flex flex-row items-center gap-2 text-sm" href="/">
				<ArrowLeftIcon className="h-2 w-2" />
				Zurück zur Startseite
			</Link>
		</main>
	);
}
