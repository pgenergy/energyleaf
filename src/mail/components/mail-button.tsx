import { Button, Container } from "@react-email/components";

interface MailButtonProps {
	href: string;
	children: string;
}

export default function MailButton({ href, children }: MailButtonProps) {
	return (
		<Container
			style={{
				margin: "32px 0",
				display: "flex",
				flexDirection: "row",
				justifyContent: "center",
			}}
		>
			<Button
				href={href}
				style={{
					margin: "0",
					borderRadius: "4px",
					backgroundColor: "#439869",
					color: "#fff1f2",
					paddingInline: "16px",
					paddingBlock: "8px",
				}}
			>
				{children}
			</Button>
		</Container>
	);
}
