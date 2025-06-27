import { TimezoneTypeToTimeZone } from "@/lib/enums";
import { ErrorTypes, LogSystemTypes } from "@/lib/log-types";
import { db } from "@/server/db";
import { userTable } from "@/server/db/tables/user";
import { logError, logSystem } from "@/server/queries/logs";
import { getSensorIdFromSensorToken, insertEnergyData } from "@/server/queries/sensor";
import { energyleaf, parseReadableStream } from "@energyleaf/proto";
import { waitUntil } from "@vercel/functions";
import { toZonedTime } from "date-fns-tz";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

const { SensorDataRequestV2, SensorDataRequest, SensorDataResponse } = energyleaf;

export const POST = async (req: NextRequest) => {
	const body = req.body;
	if (!body) {
		waitUntil(
			logSystem({
				fn: LogSystemTypes.ENERGY_INPUT_V1,
				details: {
					sensor: null,
					user: null,
					reason: ErrorTypes.INVALID_INPUT,
				},
			})
		);
		return new NextResponse(SensorDataResponse.toBinary({ status: 400, statusMessage: "No body" }), {
			status: 400,
			headers: {
				"Content-Type": "application/x-protobuf",
			},
		});
	}
	try {
		const binaryData = await parseReadableStream(body);
		let data: {
			accessToken: string;
			value: number;
			valueOut?: number;
			valueCurrent?: number;
			timestamp?: string;
		};
		try {
			data = SensorDataRequest.fromBinary(binaryData);
		} catch {
			try {
				const parsedData = SensorDataRequestV2.fromBinary(binaryData);
				data = {
					...parsedData,
					timestamp: parsedData.timestamp ? new Date(Number(parsedData.timestamp)).toISOString() : undefined,
				};
			} catch (err) {
				console.error(err);
				waitUntil(
					logSystem({
						fn: LogSystemTypes.ENERGY_INPUT_V1,
						details: {
							sensor: null,
							user: null,
							reason: ErrorTypes.INVALID_INPUT,
						},
					})
				);
				return new NextResponse(SensorDataResponse.toBinary({ status: 400, statusMessage: "Invalid data" }), {
					status: 400,
					headers: {
						"Content-Type": "application/x-protobuf",
					},
				});
			}
		}

		console.info(data);

		if (data.value <= 0) {
			waitUntil(
				logSystem({
					fn: LogSystemTypes.ENERGY_INPUT_V1,
					details: {
						sensor: null,
						user: null,
						reason: ErrorTypes.INPUT_IS_ZERO,
					},
				})
			);
			return new NextResponse(
				SensorDataResponse.toBinary({ status: 400, statusMessage: "Value is equal to or less than zero" }),
				{
					status: 400,
					headers: {
						"Content-Type": "application/x-protobuf",
					},
				}
			);
		}

		try {
			const sensor = await getSensorIdFromSensorToken(data.accessToken);
			let needsSum = false;
			if (sensor.script && sensor.script.split("\n").length === 1 && sensor.script.match(/^\d+$/)) {
				needsSum = true;
			}
			if (!sensor.userId) {
				waitUntil(
					logSystem({
						fn: LogSystemTypes.ENERGY_INPUT_V1,
						details: {
							sensor: sensor.id,
							user: null,
							reason: ErrorTypes.USER_NOT_FOUND,
						},
					})
				);
				throw new Error("sensor/no-user");
			}
			const users = await db
				.select({
					tz: userTable.timezone,
				})
				.from(userTable)
				.where(eq(userTable.id, sensor.userId));
			if (users.length === 0) {
				waitUntil(
					logSystem({
						fn: LogSystemTypes.ENERGY_INPUT_V1,
						details: {
							sensor: sensor.id,
							user: null,
							reason: ErrorTypes.USER_NOT_FOUND,
						},
					})
				);
				throw new Error("sensor/no-user");
			}
			let tz = "Europe/Berlin";
			if (users[0].tz) {
				tz = TimezoneTypeToTimeZone[users[0].tz];
			}

			// we set the time to always be in the users timezone
			const date = data.timestamp ? new Date(data.timestamp) : new Date();
			const tzDate = toZonedTime(date, tz);

			const inputData = {
				sensorId: sensor.id,
				value: data.value,
				valueOut: data.valueOut,
				valueCurrent: data.valueCurrent,
				sum: needsSum,
				timestamp: tzDate,
			};

			try {
				await insertEnergyData(inputData);
			} catch (e) {
				console.error(e);
				if ((e as unknown as Error).message === "value/too-high") {
					waitUntil(
						logSystem({
							fn: LogSystemTypes.ENERGY_INPUT_V1,
							details: {
								sensor: sensor.id,
								user: sensor.userId,
								reason: ErrorTypes.INPUT_TOO_HIGH,
								data,
							},
						})
					);
					return new NextResponse(
						SensorDataResponse.toBinary({ statusMessage: "Value too high", status: 400 }),
						{
							status: 400,
							headers: {
								"Content-Type": "application/x-protobuf",
							},
						}
					);
				}
			}

			return new NextResponse(SensorDataResponse.toBinary({ status: 200 }), {
				status: 200,
				headers: {
					"Content-Type": "application/x-protobuf",
				},
			});
		} catch (e) {
			console.error(e);
			if ((e as unknown as Error).message === "token/expired") {
				return new NextResponse(SensorDataResponse.toBinary({ statusMessage: "Token expired", status: 401 }), {
					status: 401,
					headers: {
						"Content-Type": "application/x-protobuf",
					},
				});
			}

			if ((e as unknown as Error).message === "token/invalid") {
				return new NextResponse(SensorDataResponse.toBinary({ statusMessage: "Token invalid", status: 401 }), {
					status: 401,
					headers: {
						"Content-Type": "application/x-protobuf",
					},
				});
			}

			if ((e as unknown as Error).message === "token/not-found") {
				return new NextResponse(
					SensorDataResponse.toBinary({ statusMessage: "Token not found", status: 401 }),
					{
						status: 401,
						headers: {
							"Content-Type": "application/x-protobuf",
						},
					}
				);
			}

			if (
				(e as unknown as Error).message === "sensor/not-found" ||
				(e as unknown as Error).message === "sensor/no-user"
			) {
				return new NextResponse(
					SensorDataResponse.toBinary({ statusMessage: "Sensor not found", status: 404 }),
					{
						status: 404,
						headers: {
							"Content-Type": "application/x-protobuf",
						},
					}
				);
			}

			waitUntil(
				logError({
					fn: LogSystemTypes.ENERGY_INPUT_V1,
					error: e as unknown as Error,
					details: {
						session: null,
						user: null,
					},
				})
			);
			return new NextResponse(SensorDataResponse.toBinary({ statusMessage: "Database error", status: 500 }), {
				status: 500,
				headers: {
					"Content-Type": "application/x-protobuf",
				},
			});
		}
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogSystemTypes.ENERGY_INPUT_V1,
				error: err as unknown as Error,
				details: {
					session: null,
					user: null,
				},
			})
		);
		return new NextResponse(SensorDataResponse.toBinary({ status: 400, statusMessage: "Invalid data" }), {
			status: 400,
			headers: {
				"Content-Type": "application/x-protobuf",
			},
		});
	}
};
