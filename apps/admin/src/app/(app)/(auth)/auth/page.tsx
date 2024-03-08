import AuthForm from "@/components/auth/auth-signin";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

export default function AuthPage() {
    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Energyleaf Admin Login</CardTitle>
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
