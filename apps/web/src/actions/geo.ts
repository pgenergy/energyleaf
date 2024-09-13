import type { IDefaultActionReturnPayload } from "@energyleaf/lib";
import { log } from "@energyleaf/postgres/query/logs";
import { waitUntil } from "@vercel/functions";

export interface OpenStreetMapProps {
    lat: number;
    lon: number;
    display_name: string;
}

export const lookupGeoLocation = async (address: string): Promise<IDefaultActionReturnPayload<OpenStreetMapProps>> => {
    const osmReq = await fetch(
        `https://nominatim.openstreetmap.org/search.php?q=${address}&accept-language=de&format=jsonv2`,
    );

    const body = (await osmReq.json()) as OpenStreetMapProps[];

    if (!osmReq.ok || !!body) {
        waitUntil(log("geo/lookup", "error", "geo", "web", osmReq));
        return {
            success: false,
            message: "OpenStreetMap Request Error",
        };
    }

    return {
        success: true,
        message: "OK",
        payload: body[0],
    };
};
