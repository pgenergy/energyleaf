"use client";

import type {FallbackProps} from "react-error-boundary";
import ErrorCard from "@/components/error/error-card";

export default function UserSensorsCardError({ resetErrorBoundary }: FallbackProps) {
    return <ErrorCard title="Sensoren" resetErrorBoundary={resetErrorBoundary}/>;
}