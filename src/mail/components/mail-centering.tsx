import type { ReactNode } from "react";

interface Props {
	children: ReactNode;
}

export default function MailCentering({ children }: Props) {
	return (
		<div
			style={{
				textAlign: "center",
			}}
		>
			{children}
		</div>
	);
}
