import { Container, Hr, Img, Link } from "@react-email/components";
import React from "react";

interface Props {
    children: string | string[];
}

const baseUrl = "https://energyleaf.de";

export function Header({ children }: Props) {
    return (
        <Container>
            <Container className="flex justify-center">
                <Link href={baseUrl} className="">
                    <Img
                        src={`${baseUrl}/_next/image?url=%2Fimage%2Flogo%2Flogo_text.png&w=1080&q=75`}
                        height="72"
                        alt="Energyleaf Logo"
                    />
                </Link>
            </Container>
            <h2>{children}</h2>
            <Hr className="border border-border" />
        </Container>
    );
}
