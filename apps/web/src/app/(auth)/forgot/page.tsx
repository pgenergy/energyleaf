import ForgotForm from "@/components/auth/forgot-form";

import { CardContent } from "@energyleaf/ui";

export const metadata = {
    title: "Passwort vergessen | Energyleaf",
    robots: "noindex, nofollow",
};

export default function Page() {
    return (
        <CardContent>
            <ForgotForm />
        </CardContent>
    );
}
