import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { TryAgainErrorHint } from "@energyleaf/ui/error";

interface Props {
    title: string;
}

export default function ErrorCard({ title }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint />
            </CardContent>
        </Card>
    );
}
