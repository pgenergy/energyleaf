import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { getCurrentSession } from "@/server/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import bg from "../../../public/bg.png";
import logo from "../../../public/logo.png";

interface Props {
	children: React.ReactNode;
}

export default async function DashboardLayout(props: Props) {
	const { user } = await getCurrentSession();

	if (user) {
		redirect("/dashboard");
	}

	return (
		<main className="flex w-screen flex-col justify-center">
			<div className="fixed inset-0 z-[-1] h-screen w-screen overflow-hidden object-fill">
				<Image alt="Background" fill placeholder="blur" src={bg} />
			</div>
			<div className="flex w-full flex-col items-center px-4 py-4">
				<Card className="w-full max-w-xl">
					<CardHeader>
						<div className="flex flex-row items-center justify-center gap-2">
							<Image alt="Energyleaf Logo" className="size-16" src={logo} />
							<h1 className="text-4xl">Energyleaf</h1>
						</div>
					</CardHeader>
					<CardContent>{props.children}</CardContent>
					<CardFooter className="flex flex-row items-center justify-center gap-2">
						<Link className={buttonVariants({ variant: "link" })} href="/privacy" target="_blank">
							Datenschutz
						</Link>
						<p>|</p>
						<Link href="/legal" target="_blank" className={buttonVariants({ variant: "link" })}>
							Impressum
						</Link>
					</CardFooter>
				</Card>
			</div>
		</main>
	);
}
