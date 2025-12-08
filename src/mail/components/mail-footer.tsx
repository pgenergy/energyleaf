import { Container, Hr, Link, Text } from "@react-email/components";
// biome-ignore lint/correctness/noUnusedImports: React need to be imported for react mail to work
import React from "react";

interface Props {
	baseUrl: string;
}

export function MailFooter({ baseUrl }: Props) {
	return (
		<Container>
			<Hr
				className="border-border border"
				style={{
					border: "1px solid #e4e4e7",
				}}
			/>
			<Container
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "center",
				}}
			>
				<Text
					style={{
						fontWeight: "700",
					}}
				>
					Energyleaf
				</Text>
			</Container>
			<Container
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "center",
					padding: "0",
				}}
			>
				<Text>
					<Link href={`${baseUrl}/privacy`} rel="noopener" target="_blank">
						Datenschutz
					</Link>{" "}
					|{" "}
					<Link href={`${baseUrl}/legal`} rel="noopener" target="_blank">
						Impressum
					</Link>
				</Text>
			</Container>
		</Container>
	);
}
