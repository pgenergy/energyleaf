import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
	title: "Simulation - Admin Einstellungen - Energyleaf",
};

export default function AdminSimulationSettingsPage() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Simulation Einstellungen</CardTitle>
				<CardDescription>Globale Simulationseinstellungen werden hier konfiguriert.</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-muted-foreground">Diese Funktion wird in Kürze verfügbar sein.</p>
			</CardContent>
		</Card>
	);
}
