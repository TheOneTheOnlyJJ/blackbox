export const USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS = {
  userId: {
    title: "User ID",
    format: "uuid"
  },
  name: {
    title: "Name",
    minLength: 1
  },
  password: {
    title: "Password",
    minLength: 1
  },
  description: {
    title: "Description"
  }
} as const;
