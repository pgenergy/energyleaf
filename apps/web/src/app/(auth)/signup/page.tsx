import SignUpForm from "@/components/auth/signup-form";

import { CardContent } from "@energyleaf/ui";

export const runtime = "nodejs";

export default function Page() {
    return (
        <CardContent>
            <SignUpForm />
        </CardContent>
    );
}
