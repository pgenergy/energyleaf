import { cn } from "@energyleaf/tailwindcss/utils";
import React from "react";

interface Props {
    className?: string;
}

export default function Oven({ className }: Props) {
    return <span className={cn("icon-[hugeicons--oven]", className)} />;
}
