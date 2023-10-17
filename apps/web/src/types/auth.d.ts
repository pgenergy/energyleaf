import type { User } from "next-auth";

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        created: string | null;
        sensorId: string;
        refresh: number;
    }
}

declare module "next-auth/adapters" {
    interface AdapterUser {
        id: string;
        created: string | null;
        sensorId: string;
    }
}

declare module "next-auth" {
    interface Session {
        user: User & {
            id: string;
            created: string | null;
            sensorId: string;
        };
    }
}
