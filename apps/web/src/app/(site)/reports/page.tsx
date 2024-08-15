import { getSession } from "@/lib/auth/auth.server";
import { getLastReportId } from "@/query/reports";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
    const { user } = await getSession();
    if (!user) {
        redirect("/");
    }

    const reportId = await getLastReportId(user.id);
    if (!reportId) {
        redirect("/");
    }
    redirect(`/reports/${reportId}`);
}
