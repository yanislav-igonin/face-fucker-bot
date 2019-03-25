class UserError extends Error {
  constructor(...params) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserError);
    }

    this.isUserError = true;
    this.date = new Date();
  }
}

module.exports = UserError;