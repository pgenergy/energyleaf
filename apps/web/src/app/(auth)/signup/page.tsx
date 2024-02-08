import Image from "next/image";
import SignUpComponent from "@/components/auth/signup-component";

import { CardContent } from "@energyleaf/ui";

export default function Page() {
    return (
        <CardContent>
            <SignUpComponent />
        </CardContent>
    );
}
