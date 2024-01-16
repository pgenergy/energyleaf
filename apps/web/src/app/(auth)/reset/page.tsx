import ResetForm from "@/components/auth/reset-form";

import { CardContent } from "@energyleaf/ui";

export const runtime = "nodejs";

export default function Page() {
    return (
        <CardContent>
            <ResetForm />
        </CardContent>
    );
}
