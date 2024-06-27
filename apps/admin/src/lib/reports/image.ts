import { env } from "@/env.mjs";
import { put } from "@energyleaf/storage";

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
    return uploadImage(base64);
}

async function uploadImage(base64: string) {
    const blob = await b64toBlob(base64);
    if (
        !env.AWS_REGION ||
        !env.BUCKET_NAME ||
        !env.AWS_ACCESS_KEY_ID ||
        !env.AWS_SECRET_ACCESS_KEY ||
        !env.AWS_ENDPOINT_URL_S3 ||
        !env.FILE_URL
    ) {
        console.warn("S3 credentials missing");
        return base64;
    }
    const key = await put({
        bucket: env.BUCKET_NAME,
        path: "reports",
        keyId: env.AWS_ACCESS_KEY_ID,
        secret: env.AWS_SECRET_ACCESS_KEY,
        endpoint: env.AWS_ENDPOINT_URL_S3,
        region: env.AWS_REGION,
        body: blob,
    });
    return `${env.FILE_URL}/${key}`;
}

const b64toBlob = (base64: string) => fetch(base64).then((res) => res.blob());
