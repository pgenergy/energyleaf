import { Body, Container } from "@react-email/components";
import type { ReactElement } from "react";

interface Props {
	children: ReactElement[];
}

export function MailMain({ children }: Props) {
	return (
		<Body
			className="bg-background text-foreground font-sans"
			style={{
				backgroundColor: "#ffffff",
				fontFamily:
					"ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
				color: "#09090b",
			}}
		>
			<Container
				style={{
					margin: "0 auto",
					maxWidth: "576px",
					gap: "16px",
					paddingInline: "32px",
					paddingBlock: "16px",
				}}
			>
				{children}
			</Container>
		</Body>
	);
}
