"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "../ui/button";

interface Props {
	links: {
		slug: string;
		href: string;
		label: string;
	}[];
}

export default function PageHeaderNav(props: Props) {
	return (
		<ul className="flex flex-row items-center gap-2">
			{props.links.map((link) => (
				<NavLink key={link.slug} link={link} />
			))}
		</ul>
	);
}

interface NavLinkProps {
	link: {
		href: string;
		label: string;
	};
}

function NavLink(props: NavLinkProps) {
	const pathname = usePathname();

	return (
		<li>
			<Link
				className={buttonVariants({ variant: pathname === props.link.href ? "default" : "outline" })}
				href={props.link.href}
			>
				{props.link.label}
			</Link>
		</li>
	);
}
