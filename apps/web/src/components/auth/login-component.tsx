"use client";

import React, { Suspense, useState } from "react";
import { loginSchema } from "@/lib/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button, Skeleton } from "@energyleaf/ui";

import LoginForm from "./login-form";

interface FallbackProps {
    error: Error & { digest?: string };
    resetErrorBoundary: () => void;
}

export default function LoginComponent() {
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            mail: "",
            password: "",
        },
    });
    const [formKey, setFormKey] = useState(form);
    function errorFallback({ error, resetErrorBoundary }: FallbackProps) {
        return (
            <div className="flex flex-col gap-2">
                <p className="text-xl font-bold">Willkommen bei Energyleaf!</p>
                <div className="flex flex-row gap-2">
                    <AlertTriangleIcon />
                    <p>Ein Fehler ist aufgetreten{error.message ? `: "${error.message}"` : ""}</p>
                </div>
                <br />
                <Button onClick={resetErrorBoundary} type="button" variant="ghost">
                    <RotateCwIcon className="mr-2 h-4 w-4" />
                    Erneut versuchen
                </Button>
            </div>
        );
    }
    const logError = (error: Error) => {
        track(`LoginForm.${error.name}("${error.message}")`);
    };

    return (
        <ErrorBoundary
            FallbackComponent={errorFallback}
            onError={logError}
            onReset={() => {
                setFormKey(form);
            }}
            resetKeys={[formKey]}
        >
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                <LoginForm form={formKey} />
            </Suspense>
        </ErrorBoundary>
    );
}
