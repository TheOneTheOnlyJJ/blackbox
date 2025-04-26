import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { UUID } from "node:crypto";

export interface IUserDataBox {
  boxId: UUID;
  storageId: UUID;
  name: string;
  description: string | null;
}

export const USER_DATA_BOX_JSON_SCHEMA: JSONSchemaType<IUserDataBox> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    boxId: { type: "string", format: "uuid" },
    storageId: { type: "string", format: "uuid" },
    name: { type: "string", minLength: 1 },
    description: {
      type: "string",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    }
  },
  required: ["boxId", "name", "storageId", "description"],
  additionalProperties: false
} as const;

export const isValidUserDataBox: ValidateFunction<IUserDataBox> = AJV.compile<IUserDataBox>(USER_DATA_BOX_JSON_SCHEMA);

export const isValidUserDataBoxArray = (data: unknown): data is IUserDataBox[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every((value: unknown): value is IUserDataBox => {
    return isValidUserDataBox(value);
  });
};
