interface IUserError {
  name: string;
  isUserError: boolean;
}

class UserError extends Error implements IUserError {
  public isUserError: boolean;

  public constructor(message: string) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
    this.isUserError = true;
  }
}

export default UserError;
