interface UserError {
  name: string;
  isUserError: boolean;
}

class CustomUserError extends Error implements UserError {
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

export default CustomUserError;
