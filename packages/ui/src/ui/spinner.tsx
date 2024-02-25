import * as React from "react";
import {Loader2Icon} from "lucide-react";

const Spinner= React.forwardRef<
    React.ElementRef<typeof Spinner.Root>,
    React.ComponentPropsWithoutRef<typeof Spinner.Root>
>(({ className, ...props }, ref) => (
    <Loader2Icon className={"animate-spin " + className} />
));

export { Spinner };