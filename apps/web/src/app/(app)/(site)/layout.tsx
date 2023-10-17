import Footer from "@/components/footer/footer";
import Navbar from "@/components/nav/navbar";
import Sidebar from "@/components/nav/sidebar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <Sidebar />
            <main className="ml-[13%] mt-14 px-8 py-8">{children}</main>
            <Footer />
        </>
    );
}
