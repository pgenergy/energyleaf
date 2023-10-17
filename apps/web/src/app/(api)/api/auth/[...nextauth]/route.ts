import { authOptions } from "@/lib/auth/auth";
import NextAuth from "next-auth";

export const runtime = "nodejs";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- This is the only way to export the handler, because NextAuth returns any
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
