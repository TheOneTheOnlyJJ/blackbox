export const USER_DATA_TEMPLATE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS = {
  name: {
    title: "Name",
    minLength: 1
  },
  description: {
    title: "Description"
  },
  boxId: {
    title: "Box ID",
    format: "uuid"
  },
  storageId: {
    title: "Storage ID",
    format: "uuid"
  }
} as const;
