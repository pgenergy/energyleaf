import {Container, Hr, Img, Link, Text} from "@react-email/components";
import React from "react";

const baseUrl = "https://energyleaf-web.vercel.app"

export default function Footer() {
    return (
        <Container>
            <Hr className="border border-border"/>
            <Container className="flex flex-row justify-center">
                {/*<Img src={`${baseUrl}/_next/image?url=%2Fimage%2Flogo%2Flogo.png&w=1080&q=75`} height="72"/>*/}
                <Text className="font-bold">Energyleaf</Text>
            </Container>
            <Container className="flex flex-row justify-center p-0">
                <Text>
                    <Link
                        className="hover:underline"
                        href="https://www.iism.kit.edu/datenschutz.php"
                        rel="noopener"
                        target="_blank"
                    >
                        Datenschutz
                    </Link> | <Link className="hover:underline" href="https://www.iism.kit.edu/impressum.php"
                                    rel="noopener" target="_blank">
                    Impressum
                </Link>
                </Text>
            </Container>
        </Container>
    );
}
