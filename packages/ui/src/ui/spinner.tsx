import { cn } from "@energyleaf/tailwindcss/utils";
import { Loader2Icon } from "lucide-react";
import * as React from "react";

const Spinner = React.forwardRef<
    React.ElementRef<typeof Spinner.Root>,
    React.ComponentPropsWithoutRef<typeof Spinner.Root>
>(({ className, ...props }, ref) => <Loader2Icon className={cn("animate-spin", className)} />);

export { Spinner };
