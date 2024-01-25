export class UserNotLoggedInError extends Error {
    constructor() {
        super("User is not logged in");
    }
}

export class UserNotFoundError extends Error {
    constructor() {
        super("User not found");
    }
}
