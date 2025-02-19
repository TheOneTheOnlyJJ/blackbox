export const USER_SIGN_UP_DATA_CONSTANTS = {
  username: {
    minLength: 1,
    maxLength: 50,
    pattern: "^[a-zA-Z0-9_]+$"
  },
  password: {
    minLength: 6
  }
} as const;
