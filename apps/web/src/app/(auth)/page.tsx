import LoginForm from "@/components/auth/login-form";
import { CardContent } from "@energyleaf/ui";

export const metadata = {
    title: "Energyleaf",
};

export default function Page() {
    return (
        <CardContent>
            <LoginForm />
        </CardContent>
    );
}
