"use client";

import React, {useMemo, useEffect, useState, useCallback} from "react";
import {cva, VariantProps} from "class-variance-authority";
import {cn} from "@energyleaf/tailwindcss/utils";


const circularProgressVariants = cva(
    "w-full h-full fill-transparent",
    {
        variants: {
            variant: {
                default: "stroke-primary",
                destructive: "stroke-destructive",
                secondary: "stroke-secondary",
                warning: "stroke-warning"
            }
        },
        defaultVariants: {
            variant: "default"
        },
    },
);

interface Props extends VariantProps<typeof circularProgressVariants> {
    progress: number;
    size?: number;
    strokeWidth?: number;
    children?: React.ReactNode;
}

const CircularProgress = ({progress, variant, children, size = 100, strokeWidth = 10}: Props) => {
    if (progress < 0 || progress > 100) {
        throw new Error("Progress must be between 0 and 100");
    }

    const [center, radius, arcLength] = useMemo(() => {
        const center = size / 2;
        const radius = center - strokeWidth;
        const arcLength = 2 * Math.PI * radius;
        return [center, radius, arcLength];
    }, [size, strokeWidth]);

    const arcOffset = useMemo(() => arcLength * ((100 - progress) / 100), [arcLength, progress]);

    return (
        <div className={cn(`relative`, `w-[${size}px]`)} style={{ width: `${size}px`, height: `${size}px` }}>
            <svg className="w-full h-full -rotate-90 absolute top-0 left-0">
                <circle className="w-full h-full stroke-accent fill-transparent"
                        strokeWidth={strokeWidth}
                        r={radius}
                        cx={center}
                        cy={center}/>
                <circle className={cn(circularProgressVariants({ variant }))}
                        strokeWidth={strokeWidth}
                        strokeDasharray={arcLength}
                        strokeDashoffset={arcOffset}
                        r={radius}
                        cx={center}
                        cy={center}
                        style={{transition: 'stroke-dashoffset 0.3s ease'}}/>
            </svg>
            <div className="w-full h-full absolute top-0 left-0 flex flex-col justify-center items-center">
                {children}
            </div>
        </div>

    );
}

export {CircularProgress, circularProgressVariants};