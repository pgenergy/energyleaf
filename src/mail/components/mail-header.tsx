import { Container, Hr, Img, Link } from "@react-email/components";
import React from "react";

interface Props {
	children: string;
	baseUrl: string;
}

export function MailHeader({ children, baseUrl }: Props) {
	return (
		<Container>
			<Container
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "center",
				}}
			>
				<Link href={baseUrl}>
					<Img
						src={`${baseUrl}/_next/image?url=%2Fimage%2Flogo%2Flogo_text.png&w=1080&q=75`}
						height="72"
						alt="Energyleaf Logo"
					/>
				</Link>
			</Container>
			<h2>{children}</h2>
			<Hr
				className="border-border border"
				style={{
					border: "1px solid #e4e4e7",
				}}
			/>
		</Container>
	);
}
