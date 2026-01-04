import { getAllTouTariffTemplatesAdmin } from "@/server/queries/templates";
import TouTemplateCard from "./tou-template-card";

export async function TouTemplatesOverview() {
	const templates = await getAllTouTariffTemplatesAdmin();

	if (!templates || templates.length === 0) {
		return (
			<div className="col-span-1 md:col-span-2">
				<p className="text-center font-mono font-semibold">Keine Vorlagen vorhanden.</p>
			</div>
		);
	}

	return (
		<>
			{templates.map((template) => (
				<TouTemplateCard key={template.id} template={template} />
			))}
		</>
	);
}
