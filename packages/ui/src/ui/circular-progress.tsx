"use client";

import { cn } from "@energyleaf/tailwindcss/utils";
import { type VariantProps, cva } from "class-variance-authority";
import type React from "react";
import { useMemo } from "react";

const circularProgressVariants = cva("w-full h-full fill-transparent", {
    variants: {
        variant: {
            default: "stroke-primary",
            destructive: "stroke-destructive",
            secondary: "stroke-secondary",
            warning: "stroke-warning",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

interface Props extends VariantProps<typeof circularProgressVariants> {
    progress: number;
    size?: number;
    strokeWidth?: number;
    children?: React.ReactNode;
}

const CircularProgress = ({ progress, variant, children, size = 100, strokeWidth = 10 }: Props) => {
    if (progress < 0) {
        throw new Error("Progress must be between 0 and 100");
    }

    progress = progress > 100 ? 100 : progress;

    const [center, radius, arcLength] = useMemo(() => {
        const center = size / 2;
        const radius = center - strokeWidth;
        const arcLength = 2 * Math.PI * radius;
        return [center, radius, arcLength];
    }, [size, strokeWidth]);

    const arcOffset = useMemo(() => arcLength * ((100 - progress) / 100), [arcLength, progress]);

    return (
        <div className={cn("relative", `w-[${size}px]`)} style={{ width: `${size}px`, height: `${size}px` }}>
            <svg className="-rotate-90 absolute top-0 left-0 h-full w-full">
                <title>Progress</title>
                <circle
                    className="h-full w-full fill-transparent stroke-accent"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx={center}
                    cy={center}
                />
                <circle
                    className={cn(circularProgressVariants({ variant }))}
                    strokeWidth={strokeWidth}
                    strokeDasharray={arcLength}
                    strokeDashoffset={arcOffset}
                    r={radius}
                    cx={center}
                    cy={center}
                    style={{ transition: "stroke-dashoffset 0.3s ease" }}
                />
            </svg>
            <div className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center">
                {children}
            </div>
        </div>
    );
};

export { CircularProgress, circularProgressVariants };
