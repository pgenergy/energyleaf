import { NextResponse, type NextRequest } from "next/server";
import { lucia } from "./lib/auth/auth";
import { cookies } from "next/headers";

const publicRoutes = [];
const unprotectedRoutes = ["/auth"];

export default async function middleware(req: NextRequest) {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
        return {
            user: null,
            session: null,
        };
    }

    const result = await lucia.validateSession(sessionId);
    try {
        if (result.session && result.session.fresh) {
            const sessionCookie = lucia.createSessionCookie(result.session.id);
            cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }
        if (!result.session) {
            const sessionCookie = lucia.createBlankSessionCookie();
            cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }
    } catch {
        // ignore
    }
    const loggedIn = Boolean(result.user);
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

