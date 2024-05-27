import { onboardingCompleteCookieName } from "@/lib/constants";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getActionSession } from "./lib/auth/auth.action";

const publicRoutes = ["/legal", "/privacy"];
const unprotectedRoutes = ["/", "/signup", "/forgot", "/reset", "/created", "/unsubscribe", "/unsubscribed"];
const onboardingRoute = "/onboarding";

type AppVersionSpecificRoute = Record<string, Versions>;
const appVersionSpecificRoutes: AppVersionSpecificRoute = {
    "/devices": Versions.self_reflection,
    "/recommendations": Versions.support,
};

export default async function middleware(req: NextRequest) {
    const { user } = await getActionSession();
    const loggedIn = Boolean(user);
    const path = req.nextUrl.pathname;
    const onboardingComplete = cookies().get(onboardingCompleteCookieName)?.value === "true" || user?.id === "demo";

    if (loggedIn && path !== onboardingRoute && !onboardingComplete) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    if (loggedIn && path === onboardingRoute && onboardingComplete) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (unprotectedRoutes.includes(path) && loggedIn) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (![...publicRoutes, ...unprotectedRoutes].includes(path) && !loggedIn) {
        return NextResponse.redirect(new URL("/", req.url));
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
