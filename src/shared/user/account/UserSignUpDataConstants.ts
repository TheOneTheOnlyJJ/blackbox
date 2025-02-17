const USERNAME_CONSTANTS = {
  minLength: 1,
  maxLength: 50,
  pattern: "^[a-zA-Z0-9_]+$"
} as const;

const PASSWORD_CONSTANTS = {
  minLength: 6
} as const;

export const USER_SIGN_UP_DATA_CONSTANTS = {
  username: USERNAME_CONSTANTS,
  password: PASSWORD_CONSTANTS
} as const;
