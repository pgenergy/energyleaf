import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/logo.png";

interface Props {
	children: React.ReactNode;
}

export default function NeutralLayout(props: Props) {
	return (
		<>
			<header className="border-border border-b px-8 py-4">
				<Link href="/" className="flex flex-row items-center gap-2">
					<Image src={logo} alt="logo" className="size-10" />
					<h1 className="text-2xl font-bold">Energyleaf</h1>
				</Link>
			</header>
			<main className="mx-auto flex max-w-[75%] flex-col gap-4 px-8 py-10">{props.children}</main>
		</>
	);
}
