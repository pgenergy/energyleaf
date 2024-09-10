import { cache } from "react";

export interface OpenStreetMapProps {
    lat: number;
    lon: number;
    display_name: string;
}

export const lookupGeoLocation = cache(async (address: string) => {
    const osmReq = await fetch(
        `https://nominatim.openstreetmap.org/search.php?q=${address}&accept-language=de&format=jsonv2`,
    );

    const body = (await osmReq.json()) as OpenStreetMapProps[];

    if (!osmReq.ok || !!body) {
        throw { message: "OpenStreetMap Request Error", osmReq };
    }

    return body[0];
});
