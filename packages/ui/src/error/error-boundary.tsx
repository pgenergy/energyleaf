"use client";

import type { FallbackProps } from "react-error-boundary";
import { ErrorBoundary as Eb } from "react-error-boundary";

interface Props {
    children: React.ReactNode;
    fallback: React.FC<FallbackProps>;
}
function ErrorBoundary({ children, fallback }: Props) {
    return (
        <Eb
            FallbackComponent={fallback}
            onReset={() => {
                window.location.reload();
            }}
        >
            {children}
        </Eb>
    );
}

export { ErrorBoundary };