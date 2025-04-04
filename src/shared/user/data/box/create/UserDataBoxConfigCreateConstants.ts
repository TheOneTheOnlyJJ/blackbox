export const USER_DATA_BOX_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS = {
  name: {
    title: "Name",
    minLength: 1
  },
  description: {
    title: "Description"
  },
  storageId: {
    title: "Storage ID",
    format: "uuid"
  }
} as const;
