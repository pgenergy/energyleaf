import "server-only";
import { env } from "@/env";
import { genID } from "@/lib/utils";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mime from "mime-types";
import { S3Enabled } from "./check";

export const getS3Client = () => {
	if (S3Enabled()) {
		const client = new S3Client({
			credentials: {
				accessKeyId: env.S3_ACCESS_KEY!,
				secretAccessKey: env.S3_SECRET_KEY!,
			},
			region: env.S3_REGION,
			endpoint: env.S3_ENDPOINT,
			forcePathStyle: true,
		});

		return client;
	} else {
		return null;
	}
};

interface PutProps {
	path: string;
	name?: string;
	body: File | Blob;
	bucket: string;
}

export async function putS3(props: PutProps) {
	const client = getS3Client();
	if (!client) {
		return null;
	}

	let fileName = props.name;
	const fileType = props.body.type;
	if (!fileType || fileType === "") {
		throw new Error("File type is required");
	}
	if (!fileName) {
		const ext = mime.extension(fileType);
		if (!ext) {
			throw new Error("No extension found");
		}
		const random = genID();
		fileName = `${random}.${ext}`;
	}
	const key = `${props.path}/${fileName}`;
	const buffer = Buffer.from(await props.body.arrayBuffer());

	const command = new PutObjectCommand({
		Bucket: props.bucket,
		Body: buffer,
		ContentType: fileType,
		Key: key,
	});

	await client.send(command);

	return {
		key,
		contentType: fileType,
	};
}

interface GetProps {
	key: string;
	bucket: string;
}

export async function getS3(props: GetProps) {
	const client = getS3Client();
	if (!client) {
		return null;
	}

	const command = new GetObjectCommand({
		Key: props.key,
		Bucket: props.bucket,
	});

	const res = await client.send(command);
	if (!res.Body || !res.ContentType) {
		return null;
	}

	const body = res.Body;
	const mimeType = res.ContentType;
	const stream = body.transformToWebStream();

	return {
		key: props.key,
		mimeType,
		stream,
	};
}

export async function streamToFile(
	stream: ReadableStream<Uint8Array>,
	filename: string,
	mimeType: string = "application/octet-stream"
): Promise<File> {
	const response = new Response(stream, { headers: { "Content-Type": mimeType } });
	const blob = await response.blob();
	const file = new File([blob], filename, { type: mimeType });
	return file;
}

export async function getSignedS3(props: GetProps) {
	const client = getS3Client();
	if (!client) {
		return null;
	}

	const command = new GetObjectCommand({
		Key: props.key,
		Bucket: props.bucket,
	});
	const url = await getSignedUrl(client, command, {
		expiresIn: 3600,
	});

	return url;
}
