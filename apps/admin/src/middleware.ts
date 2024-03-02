import { NextResponse, type NextRequest } from "next/server";
import { getActionSession } from "./lib/auth/auth.action";

const publicRoutes = [];
const unprotectedRoutes = ["/auth"];

export default async function middleware(req: NextRequest) {
    const { user } = await getActionSession();
    const loggedIn = Boolean(user);
    const path = req.nextUrl.pathname;

    if (unprotectedRoutes.includes(path) && loggedIn) {
        return NextResponse.redirect("/dashboard");
    }

    if (![...publicRoutes, ...unprotectedRoutes].includes(path) && !loggedIn) {
        return NextResponse.redirect("/login");
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|image).*)"],
};

