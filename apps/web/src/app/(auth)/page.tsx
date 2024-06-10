import LoginForm from "@/components/auth/login-form";
import { CardContent } from "@energyleaf/ui/card";

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
