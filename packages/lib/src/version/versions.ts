enum Versions {
    transparency = 1 << 0,
    self_reflection = 1 << 1 | transparency,
    support = 1 << 2 | self_reflection
}

function fulfills(version: Versions, required: Versions) {
    return (version & required) === required;
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
