import ResetForm from "@/components/auth/reset-form";

import { CardContent } from "@energyleaf/ui";

export const metadata = {
    title: "Passwort zurücksetzen | Energyleaf",
    robots: "noindex, nofollow",
};

export default function Page() {
    return (
        <CardContent>
            <ResetForm />
        </CardContent>
    );
}
