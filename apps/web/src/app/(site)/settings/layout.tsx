import { getSession } from "@/lib/auth/auth.server";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { buttonVariants } from "@energyleaf/ui/button";
import { GoalIcon, LockKeyholeIcon, MailboxIcon, User2Icon, WrenchIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Einstellungen | Energyleaf",
};

interface Props {
    children: React.ReactNode;
}

export default async function SettingsPage({ children }: Props) {
    const { user } = await getSession();
    if (!user) {
        redirect("/");
    }

    return (
        <div className="flex flex-col gap-4 md:gap-8">
            <div className="flex flex-row flex-wrap items-center justify-center gap-4 md:justify-start">
                <SettingsLink href="/settings">
                    <User2Icon className="mr-2 h-4 w-4" />
                    Profil
                </SettingsLink>
                {fulfills(user.appVersion, Versions.self_reflection) ? (
                    <SettingsLink href="/settings/goals">
                        <GoalIcon className="mr-2 h-4 w-4" />
                        Ziele
                    </SettingsLink>
                ) : null}
                <SettingsLink href="/settings/reports">
                    <MailboxIcon className="mr-2 h-4 w-4" />
                    Berichte
                </SettingsLink>
                <SettingsLink href="/settings/security">
                    <LockKeyholeIcon className="mr-2 h-4 w-4" />
                    Passwort
                </SettingsLink>
                <SettingsLink href="/settings/account">
                    <WrenchIcon className="mr-2 h-4 w-4" />
                    Konto
                </SettingsLink>
            </div>
            <div className="flex flex-col gap-4">{children}</div>
        </div>
    );
}

interface SettingsLinkProps {
    href: string;
    children: React.ReactNode;
}

function SettingsLink(props: SettingsLinkProps) {
    return (
        <Link href={props.href} className={buttonVariants({ variant: "ghost" })}>
            {props.children}
        </Link>
    );
}
