import Image from "next/image";
import LoginComponent from "@/components/auth/login-component";

import { CardContent } from "@energyleaf/ui";

export default function Page() {
    return (
        <CardContent>
            <LoginComponent />
        </CardContent>
    );
}
