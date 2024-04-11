import { NextResponse, type NextRequest } from "next/server";

import { getActionSession } from "./lib/auth/auth.action";
import { cookies } from "next/headers";

const publicRoutes = ["/legal", "/privacy"];
const unprotectedRoutes = ["/", "/signup", "/forgot", "/reset", "/created"];
const onboardingRoute = "/onboarding";

export default async function middleware(req: NextRequest) {
    const { user } = await getActionSession();
    const loggedIn = Boolean(user);
    const path = req.nextUrl.pathname;
    const url = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const onboardingComplete = cookies().get("onboarding_complete")?.value === "true";

    if (loggedIn && path !== onboardingRoute && !onboardingComplete) {
        return NextResponse.redirect(`${url}/onboarding`);
    }

    if (loggedIn && path === onboardingRoute && onboardingComplete) {
        return NextResponse.redirect(`${url}/dashboard`);
    }

    if (unprotectedRoutes.includes(path) && loggedIn) {
        return NextResponse.redirect(`${url}/dashboard`);
    }

    if (![...publicRoutes, ...unprotectedRoutes].includes(path) && !loggedIn) {
        return NextResponse.redirect(`${url}/`);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|image).*)"],
};
