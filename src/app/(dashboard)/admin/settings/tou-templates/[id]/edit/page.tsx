import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminTouTemplateForm from "@/components/forms/admin/admin-tou-template-form";
import { getTouTariffTemplateById } from "@/server/queries/templates";

export const metadata: Metadata = {
	title: "TOU-Tarif Vorlage bearbeiten - Admin Einstellungen - Energyleaf",
};

interface Props {
	params: Promise<{
		id: string;
	}>;
}

export default async function EditTouTemplatePage({ params }: Props) {
	const { id } = await params;
	const template = await getTouTariffTemplateById(id);

	if (!template) {
		notFound();
	}

	return <AdminTouTemplateForm mode="edit" initialValues={template} />;
}
