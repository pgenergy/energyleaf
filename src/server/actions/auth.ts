"use server";

import { hash, verify } from "@node-rs/argon2";
import { waitUntil } from "@vercel/functions";
import { differenceInMinutes } from "date-fns";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { z } from "zod";
import { env } from "@/env";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import type { ElectricityMeterValue } from "@/lib/enums";
import { ErrorTypes, LogActionTypes } from "@/lib/log-types";
import { passwordChangeSchema, type signupSchema } from "@/lib/schemas/auth-schema";
import { genID } from "@/lib/utils";
import { db } from "@/server/db";
import { reportConfigTable } from "@/server/db/tables/reports";
import { tokenTable, userDataTable, userExperimentDataTable, userTable } from "@/server/db/tables/user";
import {
	createSession,
	deleteSessionTokenCookie,
	generateSessionToken,
	getCurrentSession,
	invalidateSession,
	setSessionTokenCookie,
} from "@/server/lib/auth";
import { putS3 } from "@/server/lib/storage";
import { EMailEnabled } from "../lib/check";
import { getDemoUserData } from "../lib/demo";
import { sendPasswordChangedMail, sendPasswordResetMail } from "../lib/mail";
import { logAction, logError } from "../queries/logs";

export async function demoLoginAction() {
	try {
		const cookieStore = await cookies();
		cookieStore.set(SESSION_COOKIE_NAME, "demo", {
			httpOnly: true,
			sameSite: "lax",
			secure: env.VERCEL_ENV === "production",
			expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			path: "/",
		});
		cookieStore.set("user_data", JSON.stringify(await getDemoUserData()), {
			httpOnly: true,
			sameSite: "lax",
			secure: env.VERCEL_ENV === "production",
			expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			path: "/",
		});
		return {
			success: true,
			message: "Demo gestartet.",
			path: "/dashboard",
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function loginAction(email: string, password: string) {
	try {
		const users = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1);

		if (users.length !== 1) {
			waitUntil(
				logAction({
					fn: LogActionTypes.LOGIN_ACTION,
					result: "failed",
					details: {
						user: null,
						session: null,
						reason: ErrorTypes.USER_NOT_FOUND,
					},
				}),
			);
			return {
				success: false,
				message: "E-Mail oder Passwort falsch.",
			};
		}

		const user = users[0];
		if (!user.isActive || user.deleted) {
			logAction({
				fn: LogActionTypes.LOGIN_ACTION,
				result: "failed",
				details: {
					user: user.id,
					session: null,
					reason: !user.isActive ? ErrorTypes.ACCOUNT_NOT_ACTIVE : ErrorTypes.ACCOUNT_DELETED,
				},
			});
			return {
				success: false,
				message: "Ihr Account ist nicht aktiv.",
			};
		}
		const match = await verify(user.password, password);
		if (!match) {
			waitUntil(
				logAction({
					fn: LogActionTypes.LOGIN_ACTION,
					result: "failed",
					details: {
						user: null,
						session: null,
						reason: ErrorTypes.WRONG_PASSWORD,
						email,
					},
				}),
			);
			return {
				success: false,
				message: "E-Mail oder Passwort falsch.",
			};
		}

		const token = generateSessionToken();
		const session = await createSession(token, user.id);
		await setSessionTokenCookie(token, session.expiresAt);
		waitUntil(
			logAction({
				fn: LogActionTypes.LOGIN_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: null,
					reason: null,
					email,
					path: "/dashboard",
				},
			}),
		);
		return {
			success: true,
			message: "Erfolgreich angemeldet.",
			path: "/dashboard",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.LOGIN_ACTION,
				error: err as unknown as Error,
				details: {
					email: email,
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

export async function demoLogoutAction() {
	try {
		const cookieStore = await cookies();
		cookieStore.set(SESSION_COOKIE_NAME, "", {
			httpOnly: true,
			sameSite: "lax",
			secure: env.VERCEL_ENV === "production",
			maxAge: 0,
			path: "/",
		});
		cookieStore.set("devices", "", {
			httpOnly: true,
			sameSite: "lax",
			secure: env.VERCEL_ENV === "production",
			maxAge: 0,
			path: "/",
		});
		cookieStore.set("user_data", "", {
			httpOnly: true,
			sameSite: "lax",
			secure: env.VERCEL_ENV === "production",
			maxAge: 0,
			path: "/",
		});
		return {
			success: true,
			message: "Demo beendet.",
			path: "/login",
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function logoutAction() {
	try {
		const { session, user } = await getCurrentSession();
		if (!session || !user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.LOGOUT_ACTION,
					result: "failed",
					details: {
						user: null,
						session: null,
						reason: ErrorTypes.NOT_LOGGED_IN,
					},
				}),
			);
			return {
				success: false,
				message: "Sie müssen sich erst anmelden.",
			};
		}

		try {
			await invalidateSession(session.id);
			await deleteSessionTokenCookie();
			waitUntil(
				logAction({
					fn: LogActionTypes.LOGOUT_ACTION,
					result: "success",
					details: {
						user: user.id,
						session: null,
						reason: null,
						path: "/login",
					},
				}),
			);
			return {
				success: true,
				message: "Erfolgreich abgemeldet.",
				path: "/login",
			};
		} catch (err) {
			console.error(err);
			waitUntil(
				logError({
					fn: LogActionTypes.LOGOUT_ACTION,
					error: err as unknown as Error,
					details: {
						user: user.id,
						session: null,
					},
				}),
			);
			return {
				success: false,
				message: "Es ist ein unerwarteter Fehler aufgetreten.",
			};
		}
	} catch (err) {
		console.log(err);
		waitUntil(
			logError({
				fn: LogActionTypes.LOGOUT_ACTION,
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

export async function signupExperimentAction(data: FormData) {
	const phone = data.get("phone") as string | undefined;
	const firstname = data.get("firstname") as string;
	const lastname = data.get("lastname") as string;
	const address = data.get("address") as string;
	const comment = data.get("comment") as string | undefined;
	const mail = data.get("mail") as string;
	const hasWifi = (data.get("hasWifi") as string) === "true";
	const hasPower = (data.get("hasPower") as string) === "true";
	const password = data.get("password") as string;
	const passwordRepeat = data.get("passwordRepeat") as string;
	const file = data.get("file") as File;
	const tos = (data.get("tos") as string) === "true";
	const pin = (data.get("pin") as string) === "true";
	const electricityMeterType = data.get("electricityMeterType") as ElectricityMeterValue;
	const electricityMeterNumber = data.get("electricityMeterNumber") as string;
	const participation = (data.get("participation") as string) === "true";

	if (!tos) {
		waitUntil(
			logAction({
				fn: LogActionTypes.SIGNUP_EXPERIMENT_ACTION,
				result: "failed",
				details: {
					user: null,
					session: null,
					reason: ErrorTypes.TOS_MISSING,
				},
			}),
		);
		return {
			success: false,
			message: "Sie müssen den Datenschutzbestimmungen zustimmen.",
		};
	}

	if (file && !file.type.startsWith("image/")) {
		waitUntil(
			logAction({
				fn: LogActionTypes.SIGNUP_EXPERIMENT_ACTION,
				result: "failed",
				details: {
					user: null,
					session: null,
					reason: ErrorTypes.WRONG_FILE_TYPE,
				},
			}),
		);
		return {
			success: false,
			message: "Bitte laden Sie ein Bild hoch.",
		};
	}

	if (!pin) {
		waitUntil(
			logAction({
				fn: LogActionTypes.SIGNUP_EXPERIMENT_ACTION,
				result: "failed",
				details: {
					user: null,
					session: null,
					reason: ErrorTypes.PIN_MISSING,
				},
			}),
		);
		return {
			success: false,
			message: "Sie müssen der PIN-Beantragung zustimmen...",
		};
	}

	if (password !== passwordRepeat) {
		waitUntil(
			logAction({
				fn: LogActionTypes.SIGNUP_EXPERIMENT_ACTION,
				result: "failed",
				details: {
					user: null,
					session: null,
					reason: ErrorTypes.PASSWORD_MISSMATCH,
				},
			}),
		);
		return {
			success: false,
			message: "Passwörter stimmen nicht überein.",
		};
	}

	if (mail.length >= 256) {
		waitUntil(
			logAction({
				fn: LogActionTypes.SIGNUP_EXPERIMENT_ACTION,
				result: "failed",
				details: {
					user: null,
					session: null,
					reason: ErrorTypes.STRING_TOO_LONG,
				},
			}),
		);
		return {
			success: false,
			message: "E-Mail muss unter dem Zeichenlimit von 256 Zeichen liegen.",
		};
	}
	if (password.length >= 256) {
		waitUntil(
			logAction({
				fn: LogActionTypes.SIGNUP_EXPERIMENT_ACTION,
				result: "failed",
				details: {
					user: null,
					session: null,
					reason: ErrorTypes.STRING_TOO_LONG,
				},
			}),
		);
		return {
			success: false,
			message: "Passwort muss unter dem Zeichenlimit von 256 Zeichen liegen.",
		};
	}

	try {
		const users = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, mail)).limit(1);
		if (users.length > 0) {
			waitUntil(
				logAction({
					fn: LogActionTypes.SIGNUP_EXPERIMENT_ACTION,
					result: "failed",
					details: {
						user: null,
						session: null,
						reason: ErrorTypes.EMAIL_USED,
					},
				}),
			);
			return {
				success: false,
				message: "E-Mail wird bereits verwendet.",
			};
		}

		const userId = genID(30);
		let imgKey: string | null = null;
		if (file) {
			try {
				const res = await putS3({
					body: file,
					path: "electricity_meter",
					bucket: "energyleaf",
				});

				if (res) {
					imgKey = res.key;
				}
			} catch (err) {
				console.error(err);
				waitUntil(
					logError({
						fn: LogActionTypes.SIGNUP_EXPERIMENT_ACTION,
						error: err as unknown as Error,
						details: {
							user: userId,
							session: null,
							data: {
								...data,
								password: "",
							},
							bucket: "energyleaf",
						},
					}),
				);
			}
		}
		const passwordHash = await hash(password);
		await db.transaction(async (trx) => {
			await trx.insert(userTable).values({
				id: userId,
				firstname: firstname,
				lastname: lastname,
				address: address,
				phone: phone,
				username: `${firstname} ${lastname}`,
				email: mail,
				password: passwordHash,
				isParticipant: participation,
			});
			await trx.insert(userDataTable).values({
				userId,
				electricityMeterNumber: electricityMeterNumber,
				electricityMeterType: electricityMeterType,
				electricityMeterImgUrl: imgKey,
				powerAtElectricityMeter: hasPower,
				wifiAtElectricityMeter: hasWifi,
				installationComment: comment,
			});
			await trx.insert(reportConfigTable).values({
				userId,
			});

			if (participation) {
				await trx.insert(userExperimentDataTable).values({
					userId,
					getsPaid: true,
				});
			}
		});
		waitUntil(
			logAction({
				fn: LogActionTypes.SIGNUP_EXPERIMENT_ACTION,
				result: "success",
				details: {
					user: userId,
					session: null,
					reason: null,
					path: "/created",
				},
			}),
		);
		return {
			success: true,
			message: "Konto erfolgreich erstellt.",
			path: "/created",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.SIGNUP_EXPERIMENT_ACTION,
				error: err as unknown as Error,
				details: {
					user: null,
					session: null,
					...data,
					password: "",
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function signupAction(data: z.infer<typeof signupSchema>) {
	if (!data.tos) {
		waitUntil(
			logAction({
				fn: LogActionTypes.SIGNUP_ACTION,
				result: "failed",
				details: {
					reason: ErrorTypes.TOS_MISSING,
					user: null,
					session: null,
				},
			}),
		);
		return {
			success: false,
			message: "Sie müssen den Datenschutzbestimmungen zustimmen.",
		};
	}

	if (data.password !== data.passwordRepeat) {
		waitUntil(
			logAction({
				fn: LogActionTypes.SIGNUP_ACTION,
				result: "failed",
				details: {
					reason: ErrorTypes.PASSWORD_MISSMATCH,
					user: null,
					session: null,
				},
			}),
		);
		return {
			success: false,
			message: "Passwörter stimmen nicht überein.",
		};
	}

	if (data.mail.length >= 256) {
		waitUntil(
			logAction({
				fn: LogActionTypes.SIGNUP_ACTION,
				result: "failed",
				details: {
					reason: ErrorTypes.STRING_TOO_LONG,
					user: null,
					session: null,
				},
			}),
		);
		return {
			success: false,
			message: "E-Mail muss unter dem Zeichenlimit von 256 Zeichen liegen.",
		};
	}

	if (data.password.length >= 256) {
		waitUntil(
			logAction({
				fn: LogActionTypes.SIGNUP_ACTION,
				result: "failed",
				details: {
					reason: ErrorTypes.STRING_TOO_LONG,
					user: null,
					session: null,
				},
			}),
		);
		return {
			success: false,
			message: "Passwort muss unter dem Zeichenlimit von 256 Zeichen liegen.",
		};
	}

	try {
		const users = await db
			.select({ id: userTable.id })
			.from(userTable)
			.where(eq(userTable.email, data.mail))
			.limit(1);
		if (users.length > 0) {
			waitUntil(
				logAction({
					fn: LogActionTypes.SIGNUP_ACTION,
					result: "failed",
					details: {
						reason: ErrorTypes.EMAIL_USED,
						user: null,
						session: null,
					},
				}),
			);
			return {
				success: false,
				message: "E-Mail wird bereits verwendet.",
			};
		}

		const userId = genID(30);
		const passwordHash = await hash(data.password);
		await db.transaction(async (trx) => {
			await trx.insert(userTable).values({
				id: userId,
				firstname: data.firstname,
				lastname: data.lastname,
				address: data.address,
				phone: null,
				username: `${data.firstname} ${data.lastname}`,
				email: data.mail,
				password: passwordHash,
				isParticipant: false,
			});
			await trx.insert(userDataTable).values({
				userId,
				electricityMeterNumber: null,
				electricityMeterType: null,
				electricityMeterImgUrl: null,
				installationComment: null,
			});
			await trx.insert(reportConfigTable).values({
				userId,
			});
		});
		waitUntil(
			logAction({
				fn: LogActionTypes.SIGNUP_ACTION,
				result: "success",
				details: {
					path: "/created",
					user: userId,
					session: null,
					reason: null,
				},
			}),
		);
		return {
			success: true,
			message: "Konto erfolgreich erstellt.",
			path: "/created",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.SIGNUP_ACTION,
				error: err as unknown as Error,
				details: {
					data: {
						...data,
						password: "",
					},
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

export async function forgotPasswordAction(mail: string) {
	try {
		if (!EMailEnabled()) {
			waitUntil(
				logAction({
					fn: LogActionTypes.FORGOT_PASSWORD_ACTION,
					result: "failed",
					details: {
						user: null,
						session: null,
						reason: ErrorTypes.MISSING_API_KEYS,
						mail,
					},
				}),
			);
			return;
		}

		const users = await db
			.select({ id: userTable.id, username: userTable.username, email: userTable.email })
			.from(userTable)
			.where(eq(userTable.email, mail))
			.limit(1);
		if (users.length !== 1) {
			waitUntil(
				logAction({
					fn: LogActionTypes.FORGOT_PASSWORD_ACTION,
					result: "failed",
					details: {
						user: null,
						session: null,
						reason: ErrorTypes.USER_NOT_FOUND,
						mail,
					},
				}),
			);
			return;
		}
		const user = users[0];

		const token = genID(30);
		await db.insert(tokenTable).values({
			token: token,
			userId: user.id,
			type: "password_reset",
		});

		waitUntil(
			sendPasswordResetMail({
				email: user.email,
				name: user.username,
				resetToken: token,
			}),
		);
		waitUntil(
			logAction({
				fn: LogActionTypes.FORGOT_PASSWORD_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: null,
					reason: null,
					path: "/login",
				},
			}),
		);
		return {
			success: true,
			message: "E-Mail zum Zurücksetzen des Passworts gesendet.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.FORGOT_PASSWORD_ACTION,
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

export async function resetPasswordAction(newPassword: string, token: string) {
	try {
		const tokenData = await db.select().from(tokenTable).where(eq(tokenTable.token, token)).limit(1);
		if (tokenData.length !== 1 || tokenData[0].type !== "password_reset") {
			waitUntil(
				logAction({
					fn: LogActionTypes.RESET_PASSWORD_ACTION,
					result: "failed",
					details: {
						user: null,
						session: null,
						reason: ErrorTypes.INVALID_TOKEN,
					},
				}),
			);
			return {
				success: false,
				message: "Der Link ist ungültig.",
			};
		}

		if (differenceInMinutes(tokenData[0].createdTimestamp, new Date()) > 5) {
			await db.delete(tokenTable).where(eq(tokenTable.token, token));
			waitUntil(
				logAction({
					fn: LogActionTypes.RESET_PASSWORD_ACTION,
					result: "failed",
					details: {
						user: null,
						session: null,
						reason: ErrorTypes.TOKEN_EXPIRED,
					},
				}),
			);
			return {
				success: false,
				message: "Der Link ist ungültig.",
			};
		}

		const users = await db.select().from(userTable).where(eq(userTable.id, tokenData[0].userId)).limit(1);
		if (users.length !== 1) {
			waitUntil(
				logAction({
					fn: LogActionTypes.RESET_PASSWORD_ACTION,
					result: "failed",
					details: {
						user: null,
						session: null,
						reason: ErrorTypes.INVALID_TOKEN,
					},
				}),
			);
			return {
				success: false,
				message: "Der Link ist ungültig.",
			};
		}

		const user = users[0];
		const passwordHash = await hash(newPassword);

		await db.transaction(async (trx) => {
			await trx
				.update(userTable)
				.set({
					password: passwordHash,
				})
				.where(eq(userTable.id, user.id));

			await trx.delete(tokenTable).where(eq(tokenTable.token, token));
		});
		waitUntil(
			sendPasswordChangedMail({
				email: user.email,
				name: user.username,
			}),
		);
		waitUntil(
			logAction({
				fn: LogActionTypes.RESET_PASSWORD_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: null,
					reason: null,
					token,
				},
			}),
		);
		return {
			success: true,
			message: "Passwort erfolgreich zurückgesetzt.",
			path: "/login",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.RESET_PASSWORD_ACTION,
				error: err as unknown as Error,
				details: {
					user: null,
					session: null,
					token,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function changePasswordAction(data: z.infer<typeof passwordChangeSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.CHANGE_PASSWORD_ACTION,
					result: "failed",
					details: {
						reason: ErrorTypes.NOT_LOGGED_IN,
						user: null,
						session: null,
					},
				}),
			);
			return {
				success: false,
				message: "Sie müssen sich erst anmelden.",
			};
		}

		const validate = passwordChangeSchema.safeParse(data);
		if (!validate.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.CHANGE_PASSWORD_ACTION,
					result: "failed",
					details: {
						user: user.id,
						session: sid,
						reason: ErrorTypes.INVALID_INPUT,
					},
				}),
			);
			return {
				success: false,
				message: "Die Daten sind nicht gültig.",
			};
		}

		if (data.password !== data.passwordRepeat) {
			waitUntil(
				logAction({
					fn: LogActionTypes.CHANGE_PASSWORD_ACTION,
					result: "failed",
					details: {
						user: user.id,
						session: sid,
						reason: ErrorTypes.PASSWORD_MISSMATCH,
					},
				}),
			);
			return {
				success: false,
				message: "Passwort stimmt nicht überein.",
			};
		}

		const userData = await db.select().from(userTable).where(eq(userTable.id, user.id)).limit(1);
		if (!userData || userData.length !== 1) {
			waitUntil(
				logAction({
					fn: LogActionTypes.CHANGE_PASSWORD_ACTION,
					result: "failed",
					details: {
						reason: ErrorTypes.USER_NOT_FOUND,
						user: user.id,
						session: sid,
					},
				}),
			);
			return {
				success: false,
				message: "Es ist ein unerwarteter Fehler aufgetreten.",
			};
		}

		const passwordCheck = await verify(userData[0].password, data.oldPassword);
		if (!passwordCheck) {
			waitUntil(
				logAction({
					fn: LogActionTypes.CHANGE_PASSWORD_ACTION,
					result: "failed",
					details: {
						user: user.id,
						session: sid,
						reason: ErrorTypes.WRONG_PASSWORD,
					},
				}),
			);
			return {
				success: false,
				message: "Derzeitiges Passwort stimmt nicht überein.",
			};
		}

		const passwordHash = await hash(data.password);
		await db
			.update(userTable)
			.set({
				password: passwordHash,
			})
			.where(eq(userTable.id, user.id));

		revalidatePath("/settings/security");
		waitUntil(
			sendPasswordChangedMail({
				email: userData[0].email,
				name: userData[0].username,
			}),
		);
		waitUntil(
			logAction({
				fn: LogActionTypes.CHANGE_PASSWORD_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					reason: null,
				},
			}),
		);
		return {
			success: true,
			message: "Passwort erfolgreich geändert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.CHANGE_PASSWORD_ACTION,
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
