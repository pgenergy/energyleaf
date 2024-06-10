import { Input } from "@energyleaf/ui/Input";
import { Button } from "@energyleaf/ui/button";
import type { FallbackProps } from "react-error-boundary";

export default function DevicesTableError({ resetErrorBoundary }: FallbackProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="max-w-sm">
                <Input disabled placeholder="Gerät suchen" />
            </div>
            <div className="flex flex-row justify-center rounded-md border px-8 py-4">
                <Button onClick={resetErrorBoundary}>Erneut versuchen</Button>
            </div>
        </div>
    );
}
