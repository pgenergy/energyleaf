import { energyleaf, parseReadableStream } from "@energyleaf/proto";
import { waitUntil } from "@vercel/functions";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { ErrorTypes, LogSystemTypes } from "@/lib/log-types";
import { db } from "@/server/db";
import { sensorTable } from "@/server/db/tables/sensor";
import { lower } from "@/server/db/types";
import { uint8ArrayToBuffer } from "@/server/lib/util";
import { logError } from "@/server/queries/logs";
import { createSensorToken } from "@/server/queries/sensor";

const { TokenResponse, TokenRequest } = energyleaf;

export async function POST(req: NextRequest) {
	const body = req.body;

	if (!body) {
		return new NextResponse(uint8ArrayToBuffer(TokenResponse.toBinary({ status: 400, statusMessage: "No body" })), {
			status: 400,
			headers: {
				"Content-Type": "application/x-protobuf",
			},
		});
	}

	try {
		const binaryData = await parseReadableStream(req.body);
		const reqData = TokenRequest.fromBinary(binaryData);

		console.info(reqData);

		try {
			const token = await createSensorToken(reqData.clientId);
			const sensors = await db
				.select()
				.from(sensorTable)
				.where(eq(lower(sensorTable.clientId), reqData.clientId.toLowerCase()));

			if (sensors.length === 0) {
				throw new Error("sensor/not-found");
			}

			const sensorData = sensors[0];
			if ((sensorData.needsScript || reqData.needScript) && sensorData.script) {
				let additionalData: {
					script?: string;
					analogRotationPerKwh?: number;
				};
				if (sensorData.script.split("\n").length === 1 && sensorData.script.match(/^\d+$/)) {
					const perRotation = Number.parseInt(sensorData.script, 10);
					additionalData = {
						analogRotationPerKwh: perRotation,
					};
				} else {
					additionalData = {
						script: sensorData.script,
					};
				}
				return new NextResponse(
					uint8ArrayToBuffer(
						TokenResponse.toBinary({
							status: 200,
							accessToken: token,
							expiresIn: 3600,
							...additionalData,
						}),
					),
					{
						status: 200,
						headers: {
							"Content-Type": "application/x-protobuf",
						},
					},
				);
			}
			return new NextResponse(
				uint8ArrayToBuffer(
					TokenResponse.toBinary({
						accessToken: token,
						expiresIn: 3600,
						status: 200,
					}),
				),
				{
					status: 200,
					headers: {
						"Content-Type": "application/x-protobuf",
					},
				},
			);
		} catch (err) {
			console.error(err);

			if (
				(err as unknown as Error).message === "sensor/not-found" ||
				(err as unknown as Error).message === "sensor/no-user"
			) {
				return new NextResponse(
					uint8ArrayToBuffer(TokenResponse.toBinary({ statusMessage: "Sensor not found", status: 404 })),
					{
						status: 404,
						headers: {
							"Content-Type": "application/x-protobuf",
						},
					},
				);
			}

			waitUntil(
				logError({
					fn: LogSystemTypes.TOKEN_V1,
					error: err as unknown as Error,
					details: {
						session: null,
						user: null,
						reason: ErrorTypes.UNKNOWN,
					},
				}),
			);
			return new NextResponse(
				uint8ArrayToBuffer(TokenResponse.toBinary({ statusMessage: "Database error", status: 500 })),
				{
					status: 500,
					headers: {
						"Content-Type": "application/x-protobuf",
					},
				},
			);
		}
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogSystemTypes.TOKEN_V1,
				error: err as unknown as Error,
				details: {
					session: null,
					user: null,
				},
			}),
		);
		return new NextResponse(
			uint8ArrayToBuffer(TokenResponse.toBinary({ statusMessage: "Invalid data", status: 400 })),
			{
				status: 400,
				headers: {
					"Content-Type": "application/x-protobuf",
				},
			},
		);
	}
}
