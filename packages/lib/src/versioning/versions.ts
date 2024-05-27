enum Versions {
    transparency = 0,
    self_reflection = 1,
    support = 2,
}

function fulfills(version: number | Versions, required: Versions | number) {
    return version >= required;
}

function stringify(version: Versions) {
    switch (version) {
        case Versions.transparency:
            return "Transparenz (Version 1)";
        case Versions.self_reflection:
            return "Selbst-Reflexion (Version 2)";
        case Versions.support:
            return "Support (Version 3)";
        default:
            return "Unknown";
    }
}

export { Versions, fulfills, stringify };
