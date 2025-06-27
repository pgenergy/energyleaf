"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface Props {
	title: string;
	description?: string;
}

export function ErrorCard(props: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{props.title}</CardTitle>
				{props.description && <p>{props.description}</p>}
			</CardHeader>
			<CardContent>Ein unerwarteter Fehler ist aufgetreten.</CardContent>
		</Card>
	);
}
