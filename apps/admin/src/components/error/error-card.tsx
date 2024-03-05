import {Button, Card, CardContent, CardHeader, CardTitle} from "@energyleaf/ui";
import {RotateCwIcon} from "lucide-react";
import TryAgainErrorHint from "@/components/error/try-again-error-hint";

interface Props {
    title: string;
    resetErrorBoundary: () => void;
}

export default function ErrorCard({title, resetErrorBoundary}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center flex-col">
                <TryAgainErrorHint resetErrorBoundary={resetErrorBoundary}/>
            </CardContent>
        </Card>
    );
}