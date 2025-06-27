import { ElectricityMeter } from "@/lib/enums";
import { z } from "zod";

export const loginSchema = z.object({
	mail: z
		.string({ required_error: "Bitte geben Sie eine E-Mail an." })
		.min(1, "Bitte geben Sie eine E-Mail an.")
		.email("Bitte geben Sie eine gültige E-Mail an."),
	password: z
		.string({ required_error: "Bitte geben Sie ein Passwort an." })
		.min(1, "Bitte geben Sie ein Passwort an."),
});

export const signupSchema = z
	.object({
		firstname: z
			.string({ required_error: "Bitte geben Sie ihren Namen an." })
			.min(1, { message: "Bitte geben Sie ihren Namen an." }),
		lastname: z
			.string({ required_error: "Bitte geben Sie ihren Nachnamen an." })
			.min(1, { message: "Bitte geben Sie ihren Nachnamen an." }),
		mail: z
			.string({ required_error: "Bitte geben Sie eine E-Mail an." })
			.min(1, { message: "Bitte geben Sie eine E-Mail an." })
			.email({ message: "Bitte geben Sie eine gültige E-Mail an." }),
		address: z.string().min(1, { message: "Geben Sie eine Adresse an." }).optional(),
		password: z
			.string({ required_error: "Bitte geben Sie eien Passwort an." })
			.min(8, { message: "Ihr Passwort muss eine Länge von mindestes 8 Zeichen haben." }),
		passwordRepeat: z
			.string({ required_error: "Bitte wiederholen Sie ihr Passwort." })
			.min(8, { message: "Ihr Passwort muss eine Länge von mindestesn 8 Zeichen haben." }),
		tos: z
			.boolean()
			.default(false)
			.refine((d) => d, { message: "Sie müssen die Datenschutzbestimmung bestätigen." }),
	})
	.superRefine((data, ctx) => {
		if (data.password !== data.passwordRepeat) {
			ctx.addIssue({
				code: "custom",
				message: "Passwort stimmt nicht überein",
			});
		}
	});

export const signupExperimentSchema = z
	.object({
		firstname: z
			.string({ required_error: "Bitte geben Sie ihren Namen an." })
			.min(1, { message: "Bitte geben Sie ihren Namen an." }),
		lastname: z
			.string({ required_error: "Bitte geben Sie ihren Nachnamen an." })
			.min(1, { message: "Bitte geben Sie ihren Nachnamen an." }),
		mail: z
			.string({ required_error: "Bitte geben Sie eine E-Mail an." })
			.min(1, { message: "Bitte geben Sie eine E-Mail an." })
			.email({ message: "Bitte geben Sie eine gültige E-Mail an." }),
		phone: z
			.string()
			.regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
				message: "Geben Sie eine gültige Telefonnummer ein.",
			})
			.transform((d) => d.replaceAll(" ", ""))
			.optional(),
		address: z
			.string({ required_error: "Bitte geben Sie eine Adresse an." })
			.min(1, { message: "Geben Sie eine Adresse an." }),
		password: z
			.string({ required_error: "Bitte geben Sie eien Passwort an." })
			.min(8, { message: "Ihr Passwort muss eine Länge von mindestes 8 Zeichen haben." }),
		passwordRepeat: z
			.string({ required_error: "Bitte wiederholen Sie ihr Passwort." })
			.min(8, { message: "Ihr Passwort muss eine Länge von mindestesn 8 Zeichen haben." }),
		hasWifi: z.boolean({ required_error: "Bitte treffen Sie eine Auswahl" }),
		hasPower: z.boolean({ required_error: "Bitte treffen Sie eine Auswahl" }),
		comment: z.string().optional(),
		electricityMeterNumber: z.string().min(1, { message: "Bitte geben Sie einen Zählernummer an" }),
		electricityMeterType: z.nativeEnum(ElectricityMeter, {
			message: "Bitte wählen Sie die Art ihres Zählers aus.",
			required_error: "Bitte wählen Sie die Art ihres Zählers aus.",
		}),
		file: z
			.instanceof(File)
			.refine((f) => f.size < 4000000, { message: "Das Bild darf nicht größer als 4MB sein." })
			.refine((f) => f.type.startsWith("image/"), { message: "Bitte wählen Sie ein Bild aus." }),
		tos: z
			.boolean()
			.default(false)
			.refine((d) => d, { message: "Sie müssen die Datenschutzbestimmung bestätigen." }),
		pin: z.boolean().default(false),
		participation: z.boolean().default(false),
	})
	.superRefine((data, ctx) => {
		if (data.password !== data.passwordRepeat) {
			ctx.addIssue({
				code: "custom",
				message: "Passwort stimmt nicht überein",
				path: ["passwordRepeat"],
			});
		}

		if (data.electricityMeterType === ElectricityMeter.Digital && !data.electricityMeterNumber) {
			ctx.addIssue({
				code: "custom",
				message: "Btte geben Sie ihre Zählernummer an.",
				path: ["electricityMeterNumber"],
			});
		}

		if (data.electricityMeterType === ElectricityMeter.Digital && !data.pin) {
			ctx.addIssue({
				code: "custom",
				message: "Sie müssen uns die Berechtigung geben, einen PIN zu beantragen.",
				path: ["pin"],
			});
		}
	});

export const passwordForgotSchema = z.object({
	mail: z
		.string({ required_error: "Bitte geben Sie eine E-Mail an." })
		.email({ message: "Bitte geben Sie eine gültige E-Mail an." }),
});

export const passwordResetSchema = z
	.object({
		password: z
			.string({ required_error: "Bitte geben Sie ein Passwort an." })
			.min(8, { message: "Ihr Passwort muss eine Länge von mindestes 8 Zeichen haben." }),
		passwordRepeat: z
			.string({ required_error: "Bitte wiederholen Sie ihr Passwort." })
			.min(8, { message: "Ihr Passwort muss eine Länge von mindestesn 8 Zeichen haben." }),
	})
	.superRefine((data, ctx) => {
		if (data.password !== data.passwordRepeat) {
			ctx.addIssue({
				code: "custom",
				message: "Passwort stimmt nicht überein",
				path: ["passwordRepeat"],
			});
		}
	});

export const passwordChangeSchema = z
	.object({
		password: z
			.string({ required_error: "Bitte geben Sie ein Passwort an." })
			.min(8, { message: "Ihr Passwort muss eine Länge von mindestes 8 Zeichen haben." }),
		passwordRepeat: z
			.string({ required_error: "Bitte wiederholen Sie ihr Passwort." })
			.min(8, { message: "Ihr Passwort muss eine Länge von mindestesn 8 Zeichen haben." }),
		oldPassword: z.string({ required_error: "Bitte geben Sie Ihr altes Passwort an." }),
	})
	.superRefine((data, ctx) => {
		if (data.password !== data.passwordRepeat) {
			ctx.addIssue({
				code: "custom",
				message: "Passwort stimmt nicht überein",
				path: ["passwordRepeat"],
			});
		}
	});
