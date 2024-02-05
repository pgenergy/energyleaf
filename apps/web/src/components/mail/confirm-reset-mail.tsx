import React from 'react';

export default function ConfirmResetMail({ resetUrl }) {
    return (
        <p>Diese E-Mail wurde als Antwort auf Ihre Anfrage gesendet, Ihr Passwort zurückzusetzen. Bitte klicken Sie hierzu auf den Link unten. Aus Sicherheitsgründen ist dieser nur eine Stunde gültig.
            <br/> <a href={resetUrl}>{resetUrl}</a>
            <br/> Wenn Sie dies nicht angefordert haben, empfehlen wir Ihnen, Ihre Passwörter zu ändern.
        </p>
    );
}