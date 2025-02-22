export const USER_SIGN_UP_JSON_SCHEMA_CONSTANTS = {
  username: {
    title: "Username",
    minLength: 1,
    maxLength: 50,
    pattern: "^[a-zA-Z0-9_]+$"
  },
  password: {
    title: "Password",
    minLength: 6
  }
} as const;
