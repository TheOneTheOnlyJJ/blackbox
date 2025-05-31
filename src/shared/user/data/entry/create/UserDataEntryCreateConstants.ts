export const USER_DATA_ENTRY_CREATE_JSON_SCHEMA_CONSTANTS = {
  storageId: {
    title: "Storage ID",
    format: "uuid"
  },
  boxId: {
    title: "Box ID",
    format: "uuid"
  },
  templateId: {
    title: "Template ID",
    format: "uuid"
  },
  data: {
    title: "Visibility Group ID"
  }
} as const;
