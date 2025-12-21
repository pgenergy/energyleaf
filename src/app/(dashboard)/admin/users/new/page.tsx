import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminCreateUserForm from "@/components/forms/admin/admin-create-user-form";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/server/lib/auth";

export const metadata: Metadata = {
	title: "Neuen Nutzer erstellen - Admin - Energyleaf",
};

export default async function AdminCreateUserPage() {
	const { user } = await getCurrentSession();
	if (!user) {
		redirect("/login");
	}

	if (!user.isAdmin) {
		redirect("/dashboard");
	}

	return (
		<>
			<Breadcrumb className="mb-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/admin/users">Nutzer</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Neuen Nutzer erstellen</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<Card>
				<CardHeader>
					<CardTitle>Neuen Nutzer erstellen</CardTitle>
					<CardDescription>
						Hier können Sie einen neuen Nutzer erstellen. Der Nutzer wird als inaktiv erstellt und muss
						manuell aktiviert werden.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<AdminCreateUserForm />
				</CardContent>
			</Card>
		</>
	);
}
