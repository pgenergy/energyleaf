import { Suspense } from "react";
import ForgotForm from "@/components/auth/forgot-form";
import ForgotError from "@/components/auth/forgot-form-error";
import ErrorBoundary from "@/components/error-boundary";

import { CardContent, Skeleton } from "@energyleaf/ui";

export default function Page() {
    return (
        <CardContent>
            <ErrorBoundary fallback={ForgotError}>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <ForgotForm />
                </Suspense>
            </ErrorBoundary>
        </CardContent>
    );
}
