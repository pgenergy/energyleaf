import LoginForm from "@/components/auth/login-form";

import { CardContent } from "@energyleaf/ui";

export default function Page() {
    console.log(process.env.NEXTAUTH_SECRET);
    return (
        <CardContent>
            <LoginForm />
        </CardContent>
    );
}
