import { Container, Heading, Section } from "@react-email/components";
import type { ReactElement, ReactNode } from "react";

interface Props {
	children: ReactNode;
	heading: string;
	icon?: ReactElement;
}

export default function MailCard({ children, heading, icon }: Props) {
	return (
		<Container
			className="bg-muted rounded p-2 text-center"
			style={{
				borderRadius: "4px",
				backgroundColor: "#f4f4f5",
				padding: "8px",
				textAlign: "center",
			}}
		>
			{icon}
			<Heading as="h4">{heading}</Heading>
			<Section>{children}</Section>
		</Container>
	);
}
