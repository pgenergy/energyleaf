import { cn } from "@energyleaf/tailwindcss/utils";

interface Props {
    className?: string;
}

export default function LaundryDryer({ className }: Props) {
    return <span className={cn("icon-[ph--washing-machine]", className)} />;
}
