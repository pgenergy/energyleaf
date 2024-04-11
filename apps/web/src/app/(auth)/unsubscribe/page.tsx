import {CardContent} from "@energyleaf/ui";
import UnsubscribeForm from "@/components/auth/unsubscribe-form";
import {getUserIdByToken} from "@/query/user";

export const metadata = {
    title: "Report Einstellungen bearbeiten | Energyleaf",
    robots: "noindex, nofollow",
};

export default function Page() {
        return (
        <CardContent>
            <UnsubscribeForm />
        </CardContent>
    );
}
