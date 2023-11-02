export const runtime = "nodejs";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex h-screen w-screen flex-col items-center justify-center bg-[url('/image/bg/login.png')] bg-cover bg-no-repeat">
            {children}
        </main>
    );
}
