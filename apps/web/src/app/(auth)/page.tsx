import LoginForm from "@/components/auth/login-form";
import { CardContent } from "@energyleaf/ui/card";

export const metadata = {
    title: "Energyleaf",
};

interface Props {
    searchParams?: {
        next?: string;
    };
}

export default function Page(props: Props) {
    return (
        <CardContent>
            <LoginForm next={props.searchParams?.next} />
        </CardContent>
    );
}
