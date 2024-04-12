enum Versions {
    transparency = 1 << 0,
    self_reflection = 1 << 1 | transparency,
    support = 1 << 2 | self_reflection
}

function fulfills(version: Versions, required: Versions) {
    return (version & required) === required;
}

export { Versions, fulfills };
