import {Button, Card, CardContent, CardHeader, CardTitle} from "@energyleaf/ui";

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
        <CardContent>
            <h1>Ein Fehler ist aufgetreten</h1>
            <Button onClick={resetErrorBoundary}>Erneut versuchen</Button>
        </CardContent>
        </Card>
    );
}