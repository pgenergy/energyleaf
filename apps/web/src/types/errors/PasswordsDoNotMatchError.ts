export class PasswordsDoNotMatchError extends Error {
    constructor() {
      super();
      Object.setPrototypeOf(this, PasswordsDoNotMatchError.prototype)
    }
}