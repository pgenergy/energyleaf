import AuthForm from "@/components/auth/auth-signin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import Image from "next/image";
import logo from "../../../../../public/image/logo/logo.png";

export const metadata = {
    title: "Login | Energyleaf Admin",
};

export default function AuthPage() {
    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle className="flex flex-row items-center justify-center gap-2">
                    <Image alt="Energyleaf Logo" className="h-10 w-10" src={logo} />
                    Energyleaf Admin Login
                </CardTitle>
                <CardDescription>
                    Loggen Sie sich ins Admin Dashboard ein, um Ihre Energyleaf-Instanz zu verwalten.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AuthForm />
            </CardContent>
        </Card>
    );
}
