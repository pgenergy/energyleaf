import SignUpForm from "@/components/auth/signup-form";
import { env } from "@/env.mjs";
import { CardContent } from "@energyleaf/ui/card";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Konto erstellen | Energyleaf",
    robots: "noindex, nofollow",
};

export default function Page() {
    if (env.SIGNUP_DISABLED) {
        redirect("/");
    }
    return (
        <CardContent>
            <SignUpForm />
        </CardContent>
    );
}
