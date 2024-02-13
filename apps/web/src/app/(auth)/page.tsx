import { Suspense } from "react";
import LoginForm from "@/components/auth/login-form";
import LoginError from "@/components/auth/login-form-error";
import ErrorBoundary from "@/components/error/error-boundary";

import { CardContent, Skeleton } from "@energyleaf/ui";

export default function Page() {
    return (
        <CardContent>
            <ErrorBoundary fallback={LoginError}>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <LoginForm />
                </Suspense>
            </ErrorBoundary>
        </CardContent>
    );
}
