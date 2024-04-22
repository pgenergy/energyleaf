import { Button, Container, Link, Text } from "@react-email/components";

interface CustomButtonProps {
    href: string;
    children: string;
}

interface ButtonAltProps {
    href: string;
}

export function CustomButton({ href, children }: CustomButtonProps) {
    return (
        <Container className="my-8 flex justify-center">
            <Button className="m-0 rounded bg-primary px-4 py-2 text-primary-foreground" href={href}>
                {children}
            </Button>
        </Container>
    );
}

export function ButtonAlt({ href }: ButtonAltProps) {
    return (
        <Container className="mb-8 flex flex-col gap-2 px-4 text-sm text-muted-foreground">
            <Text>Sollte der Button nicht funktionieren, nutzen Sie folgenden Link:</Text>
            <Text>
                <Link className="text-primary" href={href}>
                    {href}
                </Link>
            </Text>
        </Container>
    );
}

export function Unsubscribe({ href }: ButtonAltProps) {
    return (
        <Container className="mb-8 flex flex-col gap-2 px-4 text-muted-foreground">
            <Text>
                Falls Sie keine weitere Benachrichtigungen erhalten wollen, können Sie
                <Link className="text-primary" href={href}>
                    hier
                </Link>
                abmelden.
            </Text>
        </Container>
    );
}
