import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const publicRoutes = ["/legal"];
const unprotectedRoutes = ["/", "/signup"];

export default withAuth(
    async function middleware(req) {
        const token = await getToken({ req }); 
        const isAuth = Boolean(token);
        const path = req.nextUrl.pathname;

        if (unprotectedRoutes.includes(path) && isAuth) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        if (![...publicRoutes, ...unprotectedRoutes].includes(path) && !isAuth) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            async authorized() {
                return Promise.resolve(true);
            },
        },
    },
);

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|image).*)'
    ],
};
