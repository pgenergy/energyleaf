import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { type NextRequest, NextResponse } from "next/server";
import { getMiddlewareSession } from "./lib/auth/auth.middleware";

const publicRoutes = ["/legal", "/privacy"];
const unprotectedRoutes = ["/", "/signup", "/forgot", "/reset", "/created", "/unsubscribe", "/unsubscribed"];
const onboardingRoute = "/onboarding";

type AppVersionSpecificRoute = Record<string, Versions>;
const appVersionSpecificRoutes: AppVersionSpecificRoute = {
    "/devices": Versions.self_reflection,
    "/recommendations": Versions.support,
    "/report": Versions.support,
};

export default async function middleware(req: NextRequest) {
    const { user } = await getMiddlewareSession();
    const loggedIn = Boolean(user);
    const path = req.nextUrl.pathname;
    const onboardingCompleted = user?.onboardingCompleted ?? false;

    if (loggedIn && path !== onboardingRoute && !onboardingCompleted) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    if (loggedIn && path === onboardingRoute && onboardingCompleted) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (unprotectedRoutes.includes(path) && loggedIn) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (![...publicRoutes, ...unprotectedRoutes].includes(path) && !loggedIn) {
        const nextUrl = encodeURI(path);
        const searchParams = new URLSearchParams();
        searchParams.set("next", nextUrl);
        return NextResponse.redirect(new URL(`/?next=${nextUrl}`, req.url));
    }

    if (
        appVersionSpecificRoutes[path] &&
        user &&
        !fulfills(user.appVersion as Versions, appVersionSpecificRoutes[path])
    ) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|image).*)"],
};
