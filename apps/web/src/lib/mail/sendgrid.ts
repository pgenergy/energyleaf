import sgMail from "@sendgrid/mail";

async function SendMail(to: string, subject: string, html: string) {
    const apiKey = process.env.SENDGRID_API_KEY;
    const from = process.env.SENDGRID_API_MAIL;

    if (apiKey === undefined || from === undefined) {
        throw new Error("Check Sendgrid settings");
    }

    sgMail.setApiKey(apiKey);

    const msg = {
        to,
        from,
        subject,
        html
    };

    await sgMail.send(msg);
}

export { SendMail };