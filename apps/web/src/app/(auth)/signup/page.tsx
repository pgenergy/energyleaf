import SignUpForm from "@/components/auth/signup-form";
import { CardContent } from "@energyleaf/ui";

export const metadata = {
    title: "Konto erstellen | Energyleaf",
    robots: "noindex, nofollow",
};

export default function Page() {
    return (
        <CardContent>
            <SignUpForm />
        </CardContent>
    );
}
