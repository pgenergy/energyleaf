"use client";

import { cn } from "@energyleaf/tailwindcss/utils";
import { buttonVariants } from "@energyleaf/ui/button";
import { BookOpenTextIcon } from "lucide-react";

interface Props {
    endpoint: string | null;
}

export default function HandbookButton({ endpoint }: Props) {
    if (!endpoint) {
        return null;
    }

    return (
        <a
            href={endpoint}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hidden md:flex")}
        >
            <BookOpenTextIcon className="h-6 w-6" />
        </a>
    );
}
