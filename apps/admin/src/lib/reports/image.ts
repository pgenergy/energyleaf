import { env } from "@/env.mjs";
import { genId } from "@energyleaf/db";
import { put } from "@vercel/blob";

/**
 * Renders an image. If possible, the image is uploaded to a blob storage and the download URL is returned.
 *
 * @param renderGraph a function that rendersa graph and returns a base64 string
 * @returns The download URL of the image.
 * @remarks If no BLOB_READ_WRITE_TOKEN is set, the base64 string is returned. This is considered a fallback for development.
 * Please note that base64 images may not be supported in all email clients. In production, you should therefore always consider using a token.
 */
export async function renderImage(renderGraph: () => string) {
    const base64 = renderGraph();
    if (!env.BLOB_READ_WRITE_TOKEN) {
        // Return base64 string if no token is set. This is considered a fallback for development.
        console.warn(
            "No BLOB_READ_WRITE_TOKEN set. Returning base64 string. Consider using a token because base64 images may not be supported in all email clients.",
        );
        return base64;
    }

    return uploadImage(base64);
}

async function uploadImage(base64: string) {
    const id = genId(35);
    const fileName = `${id}.png`;
    const blob = await b64toBlob(base64);
    const res = await put(`reports/${fileName}`, blob, {
        access: "public",
        contentType: "image/png",
    });
    return res.url;
}

const b64toBlob = (base64: string) => fetch(base64).then((res) => res.blob());
