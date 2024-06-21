import { Button } from "@energyleaf/ui/button";
import { Spinner } from "@energyleaf/ui/spinner";

interface Props {
    pending: boolean;
    text: string;
}

export default function SubmitButton({ text, pending }: Props) {
    return (
        <Button className="w-full" disabled={pending} type="submit">
            {pending ? <Spinner className="mr-2 h-4 w-4" /> : null}
            {text}
        </Button>
    );
}
