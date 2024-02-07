import { Loader2Icon } from "lucide-react";

import { Button } from "@energyleaf/ui";

interface Props {
    pending: boolean;
    text: string;
}

export default function SubmitButton({ text, pending }: Props) {
    return (
        <Button className="w-full" disabled={pending} type="submit">
            {pending ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
            {text}
        </Button>
    );
}
