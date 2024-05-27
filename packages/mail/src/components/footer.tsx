import { Container, Hr, Link, Text } from "@react-email/components";
import React from "react";

const baseUrl = "https://energyleaf.de";

export function Footer() {
    return (
        <Container>
            <Hr className="border border-border" />
            <Container className="flex flex-row justify-center">
                <Text className="font-bold">Energyleaf</Text>
            </Container>
            <Container className="flex flex-row justify-center p-0">
                <Text>
                    <Link className="hover:underline" href={`${baseUrl}/privacy`} rel="noopener" target="_blank">
                        Datenschutz
                    </Link>{" "}
                    |{" "}
                    <Link className="hover:underline" href={`${baseUrl}/legal`} rel="noopener" target="_blank">
                        Impressum
                    </Link>
                </Text>
            </Container>
        </Container>
    );
}