import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import mime from "mime-types";
import { customAlphabet, urlAlphabet } from "nanoid";

const getClient = (keyId: string, secret: string, region: string, endpoint: string) => {
    const client = new S3Client({
        credentials: {
            accessKeyId: keyId,
            secretAccessKey: secret,
        },
        region,
        endpoint,
    });

    return client;
};

interface PutProps {
    path: string;
    name?: string;
    body: File | Blob;
    keyId: string;
    secret: string;
    region: string;
    endpoint: string;
    bucket: string;
}

/**
 * Upload a file to s3 storage
 *
 * @throws
 */
export async function put(props: PutProps) {
    const client = getClient(props.keyId, props.secret, props.region, props.endpoint);

    let fileName = props.name;
    const fileType = props.body.type;
    if (!fileName) {
        const nanoid = customAlphabet(urlAlphabet, 30);
        const ext = mime.extension(fileType);
        if (!ext) {
            throw new Error("No extension found");
        }
        const random = nanoid();
        fileName = `${random}.${ext}`;
    }
    const key = `${props.path}/${fileName}`;

    const command = new PutObjectCommand({
        Bucket: props.bucket,
        Body: props.body,
        Key: key,
    });

    await client.send(command);

    return {
        key,
        contentType: fileType,
    };
}
