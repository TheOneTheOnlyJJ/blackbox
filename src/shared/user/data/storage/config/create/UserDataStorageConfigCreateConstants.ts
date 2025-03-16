export const USER_DATA_STORAGE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS = {
  userId: {
    title: "User ID",
    format: "uuid"
  },
  name: {
    title: "Name",
    minLength: 1
  },
  description: {
    title: "Description"
  },
  visibilityGroupId: {
    title: "Visibility Group ID",
    format: "uuid"
  }
} as const;
