import { NextResponse, type NextRequest } from "next/server";

import { getActionSession } from "./lib/auth/auth.action";
import {fulfills, Versions} from "@energyleaf/lib";

const publicRoutes = ["/legal", "/privacy"];
const unprotectedRoutes = ["/", "/signup", "/forgot", "/reset", "/created"];
const appVersionSpecificRoutes = {
    "/devices": Versions.self_reflection,
};

export default async function middleware(req: NextRequest) {
    const { user } = await getActionSession();
    const loggedIn = Boolean(user);
    const path = req.nextUrl.pathname;
    const url = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    if (unprotectedRoutes.includes(path) && loggedIn) {
        return NextResponse.redirect(`${url}/dashboard`);
    }

    if (![...publicRoutes, ...unprotectedRoutes].includes(path) && !loggedIn) {
        return NextResponse.redirect(`${url}/`);
    }

    if (appVersionSpecificRoutes[path] && !fulfills(user!.appVersion, appVersionSpecificRoutes[path])) {
        return NextResponse.redirect(`${url}/`);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|image).*)"],
};
