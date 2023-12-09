import { SendMail } from '@/lib/mail/sendgrid';

export default async (req, res) => {
    const { email, subject, html } = req.body;

    try {
        await SendMail(email, subject, html);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}