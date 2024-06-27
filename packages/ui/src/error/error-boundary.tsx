"use client";

import { track } from "@vercel/analytics";
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
            onError={(error: Error) => {
                track(`${fallback.name}: ${error.name}("${error.message}")`);
            }}
            onReset={() => {
                window.location.reload();
            }}
        >
            {children}
        </Eb>
    );
}

export { ErrorBoundary };
