import { getSession } from "@/lib/auth/auth.server";
import Image from "next/image";
import { redirect } from "next/navigation";
import bg from "../../../../public/image/bg/login.png";

interface Props {
    children: React.ReactNode;
}

export default async function AuthLayout({ children }: Props) {
    const { session } = await getSession();
    if (session) {
        redirect("/dashboard");
    }

    return (
        <main className="flex h-screen w-screen flex-col items-center justify-center">
            <div className="fixed inset-0 z-[-1] h-screen w-screen overflow-hidden object-fill">
                <Image alt="Background" fill placeholder="blur" src={bg} />
            </div>
            {children}
        </main>
    );
}
