import { DismissedReasonEnum, type ReportProps, formatDate } from "@energyleaf/lib";
import type * as React from "react";
import { Resend } from "resend";
import AccountActivatedTemplate from "../templates/account-activated";
import AccountCreatedTemplate from "../templates/account-created";
import AdminNewAccountCreatedTemplate from "../templates/admin-new-account";
import AnomalyDetectedTemplate from "../templates/anomaly-detected";
import ExperimentDoneTemplate from "../templates/experiment-done";
import ExperimentRemovedTemplate from "../templates/experiment-remove";
import ExperimentRemovedAttentionTemplate from "../templates/experiment-remove-attention";
import ExperimentRemovedWrongMeterTemplate from "../templates/experiment-remove-wrong-meter";
import PasswordChangedTemplate from "../templates/password-changed";
import PasswordResetTemplate from "../templates/password-reset";
import PasswordResetByAdminTemplate from "../templates/password-reset-by-admin";
import ReportTemplate from "../templates/report";
import SurveyInviteTemplate from "../templates/survey-invite";
import type { AnomalyProps } from "../types";

interface MailOptions {
    apiKey: string;
    from: string;
    to: string;
}

/**
 * Create a new Resend instance
 * internal use only
 */
function createResend(apiKey: string) {
    return new Resend(apiKey);
}

interface PasswordResetMailOptions extends MailOptions {
    name: string;
    link: string;
}

/**
 * Send a password reset email
 *
 * @param from - The email to send the reset link from
 * @param to - The email to send the reset link to
 * @param name - The name of the user
 * @param link - The link to reset the password
 * @param apiKey - The API key to use for sending the email
 *
 * @returns The ID of the sent email
 * @throws An error if the email could not be sent
 */
export async function sendPasswordResetEmail({ from, to, name, link, apiKey }: PasswordResetMailOptions) {
    return sendPasswordResetMailByTemplate({ from, to, apiKey }, PasswordResetTemplate({ name, link }));
}

/**
 * Send a password reset email initiated by an admin
 *
 * @param from - The email to send the reset link from
 * @param to - The email to send the reset link to
 * @param name - The name of the user
 * @param link - The link to reset the password
 * @param apiKey - The API key to use for sending the email
 *
 * @returns The ID of the sent email
 * @throws An error if the email could not be sent
 */
export async function sendPasswordResetMailForUser({ from, to, name, link, apiKey }: PasswordResetMailOptions) {
    return sendPasswordResetMailByTemplate({ from, to, apiKey }, PasswordResetByAdminTemplate({ name, link }));
}

async function sendPasswordResetMailByTemplate({ from, to, apiKey }: MailOptions, template: React.JSX.Element) {
    if (!apiKey || apiKey === "") {
        return;
    }
    const resend = createResend(apiKey);

    const resp = await resend.emails.send({
        to,
        from,
        subject: "Passwort zurücksetzen",
        react: template,
    });

    if (resp.error) {
        throw new Error(resp.error.message);
    }

    return resp.data?.id;
}

type PasswordChangedMailOptions = MailOptions & { name: string };

/**
 * Send a password changed email
 *
 * @param from - The email to send the reset link from
 * @param to - The email to send the reset link to
 * @param name - The name of the user
 * @param apiKey - The API key to use for sending the email
 *
 * @returns The ID of the sent email
 * @throws An error if the email could not be sent
 */
export async function sendPasswordChangedEmail({ from, to, name, apiKey }: PasswordChangedMailOptions) {
    if (!apiKey || apiKey === "") {
        return;
    }
    const resend = createResend(apiKey);

    const resp = await resend.emails.send({
        to,
        from,
        subject: "Passwort geändert",
        react: PasswordChangedTemplate({ name }),
    });

    if (resp.error) {
        throw new Error(resp.error.message);
    }

    return resp.data?.id;
}

type AccountCreatedMailOptions = PasswordChangedMailOptions;

/**
 * Send an account created email
 *
 * @param from - The email to send the reset link from
 * @param to - The email to send the reset link to
 * @param name - The name of the user
 * @param apiKey - The API key to use for sending the email
 *
 * @returns The ID of the sent email
 * @throws An error if the email could not be sent
 */
export async function sendAccountCreatedEmail({ from, to, name, apiKey }: AccountCreatedMailOptions) {
    if (!apiKey || apiKey === "") {
        return;
    }
    const resend = createResend(apiKey);

    const resp = await resend.emails.send({
        to,
        from,
        subject: "Konto erstellt",
        react: AccountCreatedTemplate({ name }),
    });

    if (resp.error) {
        throw new Error(resp.error.message);
    }

    return resp.data?.id;
}

type AccountActivatedMailOptions = PasswordChangedMailOptions;

/**
 * Send an account activated email
 *
 * @param from - The email to send the reset link from
 * @param to - The email to send the reset link to
 * @param name - The name of the user
 * @param apiKey - The API key to use for sending the email
 *
 * @returns The ID of the sent email
 * @throws An error if the email could not be sent
 */
export async function sendAccountActivatedEmail({ from, to, name, apiKey }: AccountActivatedMailOptions) {
    if (!apiKey || apiKey === "") {
        return;
    }
    const resend = createResend(apiKey);

    const resp = await resend.emails.send({
        to,
        from,
        subject: "Konto aktiviert",
        react: AccountActivatedTemplate({ name }),
    });

    if (resp.error) {
        throw new Error(resp.error.message);
    }

    return resp.data?.id;
}

type AnomalyMailOptions = MailOptions & AnomalyProps;

export async function sendAnomalyEmail({ from, to, apiKey, name, link, unsubscribeLink }: AnomalyMailOptions) {
    if (!apiKey || apiKey === "") {
        return;
    }
    const resend = createResend(apiKey);

    const resp = await resend.emails.send({
        to,
        from,
        subject: "Ungewöhnlicher Verbrauch erkannt",
        react: AnomalyDetectedTemplate({ name, link, unsubscribeLink }),
    });

    if (resp.error) {
        throw new Error(resp.error.message);
    }

    return resp.data?.id;
}

type AdminNewAccountMailOptions = MailOptions & {
    name: string;
    meter: string;
    email: string;
    hasWifi: boolean;
    hasPower: boolean;
    meterNumber: string;
    participates: boolean;
};

export async function sendAdminNewAccountCreatedEmail(props: AdminNewAccountMailOptions) {
    if (!props.apiKey || props.apiKey === "") {
        return;
    }
    const resend = createResend(props.apiKey);

    const resp = await resend.emails.send({
        to: props.to,
        from: props.from,
        subject: "Neues Konto erstellt",
        react: AdminNewAccountCreatedTemplate({
            name: props.name,
            meter: props.meter,
            meterNumber: props.meterNumber,
            hasWifi: props.hasWifi,
            hasPower: props.hasPower,
            mail: props.email,
            participates: props.participates,
        }),
    });

    if (resp.error) {
        throw new Error(resp.error.message);
    }

    return resp.data?.id;
}

type ReportMailOptions = MailOptions & ReportProps & { unsubscribeLink: string } & {reportPageLink: string};

export async function sendReport(options: ReportMailOptions) {
    if (!options.apiKey || options.apiKey === "") {
        return;
    }
    const resend = createResend(options.apiKey);

    const resp = await resend.emails.send({
        to: options.to,
        from: options.from,
        subject: `Energyleaf: Bericht von ${formatDate(options.dateFrom)} bis ${formatDate(options.dateTo)}`,
        react: ReportTemplate(options, options.unsubscribeLink, options.reportPageLink),
    });

    if (resp.error) {
        throw new Error(resp.error.message);
    }

    return resp.data?.id;
}

type ExperimentRemovedMail = MailOptions & {
    name: string;
    reason?: DismissedReasonEnum;
};

export async function sendExperimentRemovedEmail(props: ExperimentRemovedMail) {
    if (!props.apiKey || props.apiKey === "") {
        return;
    }

    const resend = createResend(props.apiKey);

    if (!props.reason) {
        const resp = await resend.emails.send({
            to: props.to,
            from: props.from,
            subject: "Teilnahme nicht möglich",
            react: ExperimentRemovedTemplate({
                name: props.name,
            }),
        });
        if (resp.error) {
            throw new Error(resp.error.message);
        }

        return resp.data?.id;
    }
    if (props.reason === DismissedReasonEnum.ATTENTION_CHECK) {
        const resp = await resend.emails.send({
            to: props.to,
            from: props.from,
            subject: "Teilnahme nicht möglich",
            react: ExperimentRemovedAttentionTemplate({
                name: props.name,
            }),
        });
        if (resp.error) {
            throw new Error(resp.error.message);
        }

        return resp.data?.id;
    }
    if (props.reason === DismissedReasonEnum.WRONG_METER) {
        const resp = await resend.emails.send({
            to: props.to,
            from: props.from,
            subject: "Teilnahme nicht möglich",
            react: ExperimentRemovedWrongMeterTemplate({
                name: props.name,
            }),
        });
        if (resp.error) {
            throw new Error(resp.error.message);
        }

        return resp.data?.id;
    }
}

type SurveyInviteMailOptions = MailOptions & {
    name: string;
    surveyNumber: number;
    surveyLink: string;
};

export async function sendSurveyInviteEmail(props: SurveyInviteMailOptions) {
    if (!props.apiKey || props.apiKey === "") {
        return;
    }

    const resend = createResend(props.apiKey);

    const resp = await resend.emails.send({
        to: props.to,
        from: props.from,
        subject: "Einladung zur Umfrage",
        react: SurveyInviteTemplate({
            name: props.name,
            surveyNumber: props.surveyNumber,
            surveyLink: props.surveyLink,
        }),
    });

    if (resp.error) {
        throw new Error(resp.error.message);
    }

    return resp.data?.id;
}

type ExperimentDoneMailOptions = MailOptions & {
    name: string;
};

export async function sendExperimentDoneEmail(props: ExperimentDoneMailOptions) {
    if (!props.apiKey || props.apiKey === "") {
        return;
    }

    const resend = createResend(props.apiKey);

    const resp = await resend.emails.send({
        to: props.to,
        from: props.from,
        subject: "Teilnahme abgeschlossen",
        react: ExperimentDoneTemplate({
            name: props.name,
        }),
    });

    if (resp.error) {
        throw new Error(resp.error.message);
    }

    return resp.data?.id;
}
