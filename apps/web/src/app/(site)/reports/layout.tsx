import { getSession } from "@/lib/auth/auth.server";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { redirect } from "next/navigation";

interface Props {
    children: React.ReactNode;
}

export default async function ReportsLayout(props: Props) {
    const { user } = await getSession();
    if (!user || !fulfills(user?.appVersion, Versions.support)) {
        redirect("/dashboard");
    }

    return <>{props.children}</>;
}
