import { type NextRequest, NextResponse } from "next/server";
import { getMiddlewareSession } from "./lib/auth/auth.middleware";

const publicRoutes = [];
const unprotectedRoutes = ["/auth"];

export default async function middleware(req: NextRequest) {
    const { user } = await getMiddlewareSession();
    const loggedIn = Boolean(user);
    const path = req.nextUrl.pathname;
    const url = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    if (unprotectedRoutes.includes(path) && loggedIn) {
        return NextResponse.redirect(`${url}/dashboard`);
    }

    if (![...publicRoutes, ...unprotectedRoutes].includes(path) && !loggedIn) {
        return NextResponse.redirect(`${url}/auth`);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|image).*)"],
};
