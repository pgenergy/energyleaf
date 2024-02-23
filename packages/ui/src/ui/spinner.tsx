import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import {Loader2Icon} from "lucide-react";

const Spinner= React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
    <Loader2Icon className={"animate-spin " + className} />
));

export { Spinner };