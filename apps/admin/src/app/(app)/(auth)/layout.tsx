import Image from "next/image";
import bg from "../../../../public/image/bg/login.png";

interface Props {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
    return (
        <main className="flex h-screen w-screen flex-col items-center justify-center">
            <div className="fixed inset-0 z-[-1] h-screen w-screen overflow-hidden object-fill">
                <Image alt="Background" fill placeholder="blur" src={bg} />
            </div>
            {children}
        </main>
    );
}
