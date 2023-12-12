import type { AdapterUser } from "@auth/core/adapters";
import type { JWT } from "@auth/core/jwt";
import type { DefaultSession } from "next-auth";

interface CustomJWT extends JWT {
    id: string;
    name: string;
    email: string;
    created: string | null;
    sensorId: string;
    admin: boolean;
}

interface CustomUser extends AdapterUser {
    id: string;
    created: string | null;
    sensorId: string;
    admin: boolean;
}

interface CustomSession extends DefaultSession {
    user: {
        id: string;
        name: string;
        email: string;
        created: string | null;
        sensorId: string;
        admin: boolean;
    };
}
