import { cache } from "react";

import { getActionSession } from "./auth.action";

import "server-only";

export const getSession = cache(async () => getActionSession());
