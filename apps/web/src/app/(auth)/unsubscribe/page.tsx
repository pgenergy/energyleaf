import {CardContent} from "@energyleaf/ui";
import UnsubscribeForm from "@/components/auth/unsubscribe-form";
import {getUserData, getUserIdByToken} from "@/query/user";
import {useSearchParams} from "next/navigation";
import {reportSettingsSchema} from "@/lib/schema/profile";

export const metadata = {
    title: "Report Einstellungen bearbeiten | Energyleaf",
    robots: "noindex, nofollow",
};

export interface UnsubscribeFormProps {
    searchParams?: { token: string | undefined };

}

export default async function Page({searchParams}: UnsubscribeFormProps) {
    const token = searchParams?.token;
    const userId: string | null = token ? await getUserIdByToken(token) : null;

    if (!userId) {
        return (
            <CardContent>
                <div className="flex flex-col gap-2">
                    <p className="text-xl font-bold">Ungültiges oder abgelaufenes Passwort-Reset-Token</p>
                </div>
            </CardContent>
        );
    }

    const userData = await getUserData(userId);
    const reportConfig = {
        receiveMails: userData?.report_config.receiveMails ?? true,
        interval: userData?.report_config.interval ?? 3,
        time: userData?.report_config.time ?? 6,
    }

    return (
        <CardContent>
            <UnsubscribeForm reportConfig={reportConfig} userId={userId}/>
        </CardContent>
    );
}
