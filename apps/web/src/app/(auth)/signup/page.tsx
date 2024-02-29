import { Suspense } from "react";
import SignUpForm from "@/components/auth/signup-form";
import SignupError from "@/components/auth/signup-form-error";
import ErrorBoundary from "@/components/error-boundary";

import { CardContent, Skeleton } from "@energyleaf/ui";

export default function Page() {
    return (
        <CardContent>
            <ErrorBoundary fallback={SignupError}>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <SignUpForm />
                </Suspense>
            </ErrorBoundary>
        </CardContent>
    );
}
