import { Resend } from 'resend';

async function sendMail(to: string, subject: string, react: React.ReactElement) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_API_MAIL;

    if (apiKey === undefined || from === undefined) {
        throw new Error("Check Resend settings");
    }

    const resend = new Resend(apiKey);

    const msg = {
        from,
        to,
        subject,
        react,
    };

    await resend.emails.send(msg);
}

export { sendMail };
