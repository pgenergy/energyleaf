"use client";

import { BookOpenTextIcon } from "lucide-react";

interface Props {
    endpoint: string | null;
}

export default function HandbookButton({ endpoint }: Props) {
    if (!endpoint) {
        return null;
    }

    return (
        <a href={endpoint} target="_blank" rel="noopener noreferrer">
            <BookOpenTextIcon className="h-6 w-6" />
        </a>
    );
}
