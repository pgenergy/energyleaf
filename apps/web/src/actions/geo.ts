import { cache } from "react";

export interface OpenStreetMapProps {
    lat: number;
    lon: number;
    display_name: string;
}

export const lookupGeoLocation = cache(async (address: string) => {
    if (address === "Demo Adresse") {
        return {
            lat: 53.1389753,
            lon: 8.2146017,
            display_name: "Oldenburg",
        };
    }

    const osmReq = await fetch(
        `https://nominatim.openstreetmap.org/search.php?q=${address}&accept-language=de&format=jsonv2`,
    );

    const body = (await osmReq.json()) as OpenStreetMapProps[];

    if (!osmReq.ok || !!body) {
        throw { message: "OpenStreetMap Request Error", osmReq };
    }

    return body[0];
});
