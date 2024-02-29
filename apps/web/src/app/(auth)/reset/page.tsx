import { Suspense } from "react";
import ResetForm from "@/components/auth/reset-form";
import ResetError from "@/components/auth/reset-form-error";
import ErrorBoundary from "@/components/error-boundary";

import { CardContent, Skeleton } from "@energyleaf/ui";

export default function Page() {
    return (
        <CardContent>
            <ErrorBoundary fallback={ResetError}>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <ResetForm />
                </Suspense>
            </ErrorBoundary>
        </CardContent>
    );
}
