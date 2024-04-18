enum Versions {
    transparency,
    self_reflection,
    support
}

function fulfills(version: Versions, required: Versions) {
    return version >= required;
}

function stringify(version: Versions) {
    switch (version) {
        case Versions.transparency:
            return "Transparenz (Version 1)";
        case Versions.self_reflection:
            return "Selbst-Reflektion (Version 2)";
        case Versions.support:
            return "Support (Version 3)";
        default:
            return "Unknown";
    }
}

export { Versions, fulfills, stringify };
