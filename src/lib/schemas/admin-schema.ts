import { z } from "zod";

export const adminCreateUserSchema = z
	.object({
		firstname: z
			.string({ error: "Bitte geben Sie einen Vornamen an." })
			.min(1, { message: "Bitte geben Sie einen Vornamen an." }),
		lastname: z
			.string({ error: "Bitte geben Sie einen Nachnamen an." })
			.min(1, { message: "Bitte geben Sie einen Nachnamen an." }),
		mail: z.email({ message: "Bitte geben Sie eine gültige E-Mail an." }),
		address: z.string().min(1, { message: "Bitte geben Sie eine Adresse an." }),
		password: z
			.string({ error: "Bitte geben Sie ein Passwort an." })
			.min(8, { message: "Passwort muss mindestens 8 Zeichen haben." }),
		passwordRepeat: z
			.string({ error: "Bitte wiederholen Sie das Passwort." })
			.min(8, { message: "Passwort muss mindestens 8 Zeichen haben." }),
		isAdmin: z.boolean(),
		isParticipant: z.boolean(),
	})
	.superRefine((data, ctx) => {
		if (data.password !== data.passwordRepeat) {
			ctx.addIssue({
				code: "custom",
				message: "Passwörter stimmen nicht überein",
				path: ["passwordRepeat"],
			});
		}
	});
