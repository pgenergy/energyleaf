"use server";

import { waitUntil } from "@vercel/functions";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { z } from "zod";
import { ErrorTypes, LogActionTypes } from "@/lib/log-types";
import { sensorAssignSchema, sensorSchema, sensorUpdateSchema } from "@/lib/schemas/sensor-schema";
import { genID } from "@/lib/utils";
import { db } from "../db";
import { energyDataTable, sensorAdditionalUserTable, sensorTable, sensorTokenTable } from "../db/tables/sensor";
import { getCurrentSession } from "../lib/auth";
import { logAction, logError } from "../queries/logs";

export async function createSensorAction(data: z.infer<typeof sensorSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.CREATE_SENSOR_ACTION,
					result: "failed",
					details: {
						success: false,
						user: null,
						session: sid,
						reason: ErrorTypes.NOT_LOGGED_IN,
					},
				}),
			);
			return {
				success: false,
				message: "Bitte melden Sie sich an.",
			};
		}

		if (!user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.CREATE_SENSOR_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.NOT_ADMIN,
					},
				}),
			);
			return {
				success: false,
				message: "Sie haben keine Berechtigung für diese Aktion.",
			};
		}

		const valid = sensorSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.CREATE_SENSOR_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.INVALID_INPUT,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}

		const sensorId = genID(30);
		const needsScript = data.script !== undefined && data.script.trim().length > 0;
		const version = Number.parseInt(data.version, 10);

		await db.transaction(async (trx) => {
			await trx.insert(sensorTable).values({
				id: sensorId,
				clientId: data.clientId,
				sensorType: data.sensorType,
				version,
				needsScript,
				script: needsScript ? data.script : null,
				userId: null,
			});

			// Generate token for version 2 sensors
			if (version === 2) {
				const tokenCode = genID(30);
				await trx.insert(sensorTokenTable).values({
					code: tokenCode,
					sensorId: sensorId,
				});
			}
		});

		revalidatePath("/admin/sensors");
		waitUntil(
			logAction({
				fn: LogActionTypes.CREATE_SENSOR_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					success: true,
					reason: null,
					data: {
						sensorId,
						clientId: data.clientId,
						sensorType: data.sensorType,
						version,
						needsScript,
					},
				},
			}),
		);
		return {
			success: true,
			message: "Sensor erfolgreich erstellt.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.CREATE_SENSOR_ACTION,
				error: err as unknown as Error,
				details: {
					user: null,
					session: null,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function updateSensorAction(clientId: string, data: z.infer<typeof sensorUpdateSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_SENSOR_ACTION,
					result: "failed",
					details: {
						success: false,
						user: null,
						session: sid,
						reason: ErrorTypes.NOT_LOGGED_IN,
					},
				}),
			);
			return {
				success: false,
				message: "Bitte melden Sie sich an.",
			};
		}

		if (!user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_SENSOR_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.NOT_ADMIN,
					},
				}),
			);
			return {
				success: false,
				message: "Sie haben keine Berechtigung für diese Aktion.",
			};
		}

		const valid = sensorUpdateSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_SENSOR_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.INVALID_INPUT,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}

		const oldSensor = await db.select().from(sensorTable).where(eq(sensorTable.clientId, clientId)).limit(1);
		if (!oldSensor || oldSensor.length === 0) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_SENSOR_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.NOT_FOUND,
						data: { clientId },
					},
				}),
			);
			return {
				success: false,
				message: "Sensor wurde nicht gefunden.",
			};
		}

		const needsScript = data.script !== undefined && data.script.trim().length > 0;
		const newVersion = Number.parseInt(data.version, 10);
		const oldVersion = oldSensor[0].version;

		await db.transaction(async (trx) => {
			await trx
				.update(sensorTable)
				.set({
					sensorType: data.sensorType,
					version: newVersion,
					needsScript,
					script: needsScript ? data.script : null,
				})
				.where(eq(sensorTable.clientId, clientId));

			// Handle version changes
			if (oldVersion !== newVersion) {
				if (newVersion === 2) {
					// Version 1 → 2: Generate new token
					const tokenCode = genID(30);
					await trx.insert(sensorTokenTable).values({
						code: tokenCode,
						sensorId: oldSensor[0].id,
					});
				} else if (newVersion === 1) {
					// Version 2 → 1: Delete existing token
					await trx.delete(sensorTokenTable).where(eq(sensorTokenTable.sensorId, oldSensor[0].id));
				}
			}
		});

		revalidatePath("/admin/sensors");
		waitUntil(
			logAction({
				fn: LogActionTypes.UPDATE_SENSOR_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					success: true,
					reason: null,
					data: {
						old: {
							clientId: oldSensor[0].clientId,
							sensorType: oldSensor[0].sensorType,
							version: oldVersion,
							needsScript: oldSensor[0].needsScript,
						},
						new: {
							clientId,
							sensorType: data.sensorType,
							version: newVersion,
							needsScript,
						},
					},
				},
			}),
		);
		return {
			success: true,
			message: "Sensor erfolgreich gespeichert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.UPDATE_SENSOR_ACTION,
				error: err as unknown as Error,
				details: {
					user: null,
					session: null,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function assignSensorAction(clientId: string, data: z.infer<typeof sensorAssignSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ASSIGN_SENSOR_ACTION,
					result: "failed",
					details: {
						success: false,
						user: null,
						session: sid,
						reason: ErrorTypes.NOT_LOGGED_IN,
					},
				}),
			);
			return {
				success: false,
				message: "Bitte melden Sie sich an.",
			};
		}

		if (!user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ASSIGN_SENSOR_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.NOT_ADMIN,
					},
				}),
			);
			return {
				success: false,
				message: "Sie haben keine Berechtigung für diese Aktion.",
			};
		}

		const valid = sensorAssignSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ASSIGN_SENSOR_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.INVALID_INPUT,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}

		const sensor = await db.select().from(sensorTable).where(eq(sensorTable.clientId, clientId)).limit(1);
		if (!sensor || sensor.length === 0) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ASSIGN_SENSOR_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.NOT_FOUND,
						data: { clientId },
					},
				}),
			);
			return {
				success: false,
				message: "Sensor wurde nicht gefunden.",
			};
		}

		const oldSensor = sensor[0];

		// Check if sensor is already assigned
		if (oldSensor.userId) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ASSIGN_SENSOR_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.SENSOR_ALREADY_ASSIGNED,
						data: { clientId, currentUserId: oldSensor.userId },
					},
				}),
			);
			return {
				success: false,
				message: "Dieser Sensor ist bereits einem Nutzer zugewiesen.",
			};
		}

		// Check if user already has a sensor of this type (unique constraint)
		const existingSensor = await db
			.select()
			.from(sensorTable)
			.where(and(eq(sensorTable.userId, data.userId), eq(sensorTable.sensorType, oldSensor.sensorType)))
			.limit(1);

		if (existingSensor && existingSensor.length > 0) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ASSIGN_SENSOR_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.USER_ALREADY_HAS_SENSOR_TYPE,
						data: { clientId, userId: data.userId, sensorType: oldSensor.sensorType },
					},
				}),
			);
			return {
				success: false,
				message: "Dieser Nutzer hat bereits einen Sensor dieses Typs.",
			};
		}

		// Generate new sensor ID
		const newSensorId = genID(30);

		// Perform the assignment in a transaction
		await db.transaction(async (trx) => {
			// For Version 2 sensors, delete the existing token first (FK constraint)
			if (oldSensor.version === 2) {
				await trx.delete(sensorTokenTable).where(eq(sensorTokenTable.sensorId, oldSensor.id));
			}

			// Update sensor with new userId and new sensor ID
			await trx
				.update(sensorTable)
				.set({
					id: newSensorId,
					userId: data.userId,
				})
				.where(eq(sensorTable.clientId, clientId));

			// For Version 2 sensors, create a new token with the new sensorId
			if (oldSensor.version === 2) {
				const tokenCode = genID(30);
				await trx.insert(sensorTokenTable).values({
					code: tokenCode,
					sensorId: newSensorId,
				});
			}

			// Insert initial energy data entry
			await trx.insert(energyDataTable).values({
				sensorId: newSensorId,
				value: data.initialValue,
				consumption: 0,
				valueOut: null,
				inserted: null,
				valueCurrent: null,
				timestamp: new Date(),
			});
		});

		revalidatePath("/admin/sensors");
		waitUntil(
			logAction({
				fn: LogActionTypes.ASSIGN_SENSOR_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					success: true,
					reason: null,
					data: {
						clientId,
						oldSensorId: oldSensor.id,
						newSensorId,
						assignedUserId: data.userId,
						initialValue: data.initialValue,
					},
				},
			}),
		);
		return {
			success: true,
			message: "Sensor erfolgreich zugewiesen.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.ASSIGN_SENSOR_ACTION,
				error: err as unknown as Error,
				details: {
					user: null,
					session: null,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function regenerateSensorTokenAction(clientId: string) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.REGENERATE_SENSOR_TOKEN_ACTION,
					result: "failed",
					details: {
						success: false,
						user: null,
						session: sid,
						reason: ErrorTypes.NOT_LOGGED_IN,
					},
				}),
			);
			return {
				success: false,
				message: "Bitte melden Sie sich an.",
			};
		}

		if (!user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.REGENERATE_SENSOR_TOKEN_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.NOT_ADMIN,
					},
				}),
			);
			return {
				success: false,
				message: "Sie haben keine Berechtigung für diese Aktion.",
			};
		}

		const sensor = await db.select().from(sensorTable).where(eq(sensorTable.clientId, clientId)).limit(1);
		if (!sensor || sensor.length === 0) {
			waitUntil(
				logAction({
					fn: LogActionTypes.REGENERATE_SENSOR_TOKEN_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.NOT_FOUND,
						data: { clientId },
					},
				}),
			);
			return {
				success: false,
				message: "Sensor wurde nicht gefunden.",
			};
		}

		const sensorData = sensor[0];

		// Only version 2 sensors can have tokens
		if (sensorData.version !== 2) {
			return {
				success: false,
				message: "Nur Sensoren mit Version 2 können einen Token haben.",
			};
		}

		const newTokenCode = genID(30);

		await db.transaction(async (trx) => {
			// Delete existing token
			await trx.delete(sensorTokenTable).where(eq(sensorTokenTable.sensorId, sensorData.id));
			// Insert new token
			await trx.insert(sensorTokenTable).values({
				code: newTokenCode,
				sensorId: sensorData.id,
			});
		});

		revalidatePath("/admin/sensors");
		revalidatePath(`/admin/sensors/${encodeURIComponent(clientId)}`);
		waitUntil(
			logAction({
				fn: LogActionTypes.REGENERATE_SENSOR_TOKEN_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					success: true,
					reason: null,
					data: {
						clientId,
						sensorId: sensorData.id,
					},
				},
			}),
		);
		return {
			success: true,
			message: "Token erfolgreich neu generiert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.REGENERATE_SENSOR_TOKEN_ACTION,
				error: err as unknown as Error,
				details: {
					user: null,
					session: null,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function addAdditionalSensorUserAction(sensorId: string, userId: string) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADD_ADDITIONAL_SENSOR_USER_ACTION,
					result: "failed",
					details: {
						success: false,
						user: null,
						session: sid,
						reason: ErrorTypes.NOT_LOGGED_IN,
					},
				}),
			);
			return {
				success: false,
				message: "Bitte melden Sie sich an.",
			};
		}

		if (!user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADD_ADDITIONAL_SENSOR_USER_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.NOT_ADMIN,
					},
				}),
			);
			return {
				success: false,
				message: "Sie haben keine Berechtigung für diese Aktion.",
			};
		}

		// Check if sensor exists
		const sensor = await db.select().from(sensorTable).where(eq(sensorTable.id, sensorId)).limit(1);
		if (!sensor || sensor.length === 0) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADD_ADDITIONAL_SENSOR_USER_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.NOT_FOUND,
						data: { sensorId },
					},
				}),
			);
			return {
				success: false,
				message: "Sensor wurde nicht gefunden.",
			};
		}

		// Check if user is already the primary user
		if (sensor[0].userId === userId) {
			return {
				success: false,
				message: "Dieser Nutzer ist bereits der primäre Nutzer des Sensors.",
			};
		}

		// Check if user is already an additional user
		const existingAdditional = await db
			.select()
			.from(sensorAdditionalUserTable)
			.where(and(eq(sensorAdditionalUserTable.sensorId, sensorId), eq(sensorAdditionalUserTable.userId, userId)))
			.limit(1);

		if (existingAdditional.length > 0) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADD_ADDITIONAL_SENSOR_USER_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.USER_ALREADY_ADDITIONAL,
						data: { sensorId, userId },
					},
				}),
			);
			return {
				success: false,
				message: "Dieser Nutzer ist bereits als zusätzlicher Nutzer zugewiesen.",
			};
		}

		// Add the additional user
		await db.insert(sensorAdditionalUserTable).values({
			sensorId,
			userId,
		});

		revalidatePath("/admin/sensors");
		waitUntil(
			logAction({
				fn: LogActionTypes.ADD_ADDITIONAL_SENSOR_USER_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					success: true,
					reason: null,
					data: { sensorId, userId },
				},
			}),
		);
		return {
			success: true,
			message: "Zusätzlicher Nutzer erfolgreich hinzugefügt.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.ADD_ADDITIONAL_SENSOR_USER_ACTION,
				error: err as unknown as Error,
				details: {
					user: null,
					session: null,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function removeAdditionalSensorUserAction(sensorId: string, userId: string) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.REMOVE_ADDITIONAL_SENSOR_USER_ACTION,
					result: "failed",
					details: {
						success: false,
						user: null,
						session: sid,
						reason: ErrorTypes.NOT_LOGGED_IN,
					},
				}),
			);
			return {
				success: false,
				message: "Bitte melden Sie sich an.",
			};
		}

		if (!user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.REMOVE_ADDITIONAL_SENSOR_USER_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.NOT_ADMIN,
					},
				}),
			);
			return {
				success: false,
				message: "Sie haben keine Berechtigung für diese Aktion.",
			};
		}

		// Check if sensor exists
		const sensor = await db.select().from(sensorTable).where(eq(sensorTable.id, sensorId)).limit(1);
		if (!sensor || sensor.length === 0) {
			waitUntil(
				logAction({
					fn: LogActionTypes.REMOVE_ADDITIONAL_SENSOR_USER_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.NOT_FOUND,
						data: { sensorId },
					},
				}),
			);
			return {
				success: false,
				message: "Sensor wurde nicht gefunden.",
			};
		}

		// Check if user is an additional user
		const existingAdditional = await db
			.select()
			.from(sensorAdditionalUserTable)
			.where(and(eq(sensorAdditionalUserTable.sensorId, sensorId), eq(sensorAdditionalUserTable.userId, userId)))
			.limit(1);

		if (existingAdditional.length === 0) {
			waitUntil(
				logAction({
					fn: LogActionTypes.REMOVE_ADDITIONAL_SENSOR_USER_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.USER_NOT_ADDITIONAL,
						data: { sensorId, userId },
					},
				}),
			);
			return {
				success: false,
				message: "Dieser Nutzer ist kein zusätzlicher Nutzer des Sensors.",
			};
		}

		// Remove the additional user
		await db
			.delete(sensorAdditionalUserTable)
			.where(and(eq(sensorAdditionalUserTable.sensorId, sensorId), eq(sensorAdditionalUserTable.userId, userId)));

		revalidatePath("/admin/sensors");
		waitUntil(
			logAction({
				fn: LogActionTypes.REMOVE_ADDITIONAL_SENSOR_USER_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					success: true,
					reason: null,
					data: { sensorId, userId },
				},
			}),
		);
		return {
			success: true,
			message: "Zusätzlicher Nutzer erfolgreich entfernt.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.REMOVE_ADDITIONAL_SENSOR_USER_ACTION,
				error: err as unknown as Error,
				details: {
					user: null,
					session: null,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}
