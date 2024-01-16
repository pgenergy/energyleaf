import ForgotForm from "@/components/auth/forgot-form";

import { CardContent } from "@energyleaf/ui";

export const runtime = "nodejs";

export default function Page() {
    return (
        <CardContent>
            <ForgotForm />
        </CardContent>
    );
}
