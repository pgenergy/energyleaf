"use client";

import { BookIcon } from "lucide-react";

interface Props {
    endpoint: string | null;
}

export default function HandbookButton({ endpoint }: Props) {
    if (!endpoint) {
        return null;
    }

    return (
        <a href={endpoint}>
            <BookIcon className="h-6 w-6" />
        </a>
    );
}
