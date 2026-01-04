import type { Metadata } from "next";
import AdminTouTemplateForm from "@/components/forms/admin/admin-tou-template-form";

export const metadata: Metadata = {
	title: "Neue TOU-Tarif Vorlage - Admin Einstellungen - Energyleaf",
};

export default function NewTouTemplatePage() {
	return <AdminTouTemplateForm mode="create" />;
}
