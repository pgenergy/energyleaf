import { getSession } from "@/lib/auth/auth.server";
import { getLastReportIdByUser } from "@energyleaf/db/query";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
    const { user } = await getSession();
    if (!user) {
        redirect("/");
        return null;
    }

    const reportId = await getLastReportIdByUser(user.id);

    redirect(`/reports/${reportId}`);
    return null;
}