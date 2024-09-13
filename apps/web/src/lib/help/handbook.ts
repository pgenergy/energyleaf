import { env } from "@/env.mjs";
import { Versions } from "@energyleaf/lib/versioning";

export function getHandbookUrl(appVersion: Versions) {
    const fileUrl = env.FILE_URL;
    const fileKeyByAppVersion = {
        [Versions.transparency]: env.HANDBOOK_TRANSPARENCY_VERSION_KEY,
        [Versions.self_reflection]: env.HANDBOOK_SELF_REFLECTION_VERSION_KEY,
        [Versions.support]: env.HANDBOOK_SUPPORT_VERSION_KEY,
    };
    const handbookFileKey = fileKeyByAppVersion[appVersion];
    return handbookFileKey && fileUrl ? `${fileUrl}/${handbookFileKey}` : null;
}
