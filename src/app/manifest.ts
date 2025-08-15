import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		short_name: "Energyleaf",
		name: "Energyleaf App",
		description: "Energyleaf hilft Ihnen dabei, Ihren Stromverbrauch besser zu verstehen.",
		icons: [
			{
				src: "/favicon.ico",
				sizes: "any",
				type: "image/x-icon",
			},
		],
		start_url: "/",
		display: "standalone",
		theme_color: "#439869",
		background_color: "#ffffff",
	};
}
