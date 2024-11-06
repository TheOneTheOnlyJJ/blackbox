const USERNAME_CONSTRAINTS = {
  minLength: 1,
  maxLength: 50,
  pattern: "^[a-zA-Z0-9_]+$"
} as const;

const PASSWORD_CONSTRAINTS = {
  minLength: 6
} as const;

export const USER_SIGN_UP_DATA_CONSTRAINTS = {
  username: USERNAME_CONSTRAINTS,
  password: PASSWORD_CONSTRAINTS
} as const;
