import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserDataStorageVisibilityGroupCreateDTO {
  userId: string;
  name: string;
  password: string;
  description: string | null;
}

export const USER_DATA_STORAGE_VISIBILITY_GROUP_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<IUserDataStorageVisibilityGroupCreateDTO> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    userId: { type: "string", title: "User ID", format: "uuid" },
    name: { type: "string", title: "Name" },
    password: { type: "string", title: "Password" },
    description: {
      type: "string",
      title: "Description",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    }
  },
  required: ["userId", "name", "password", "description"],
  additionalProperties: false
} as const;

export const USER_DATA_STORAGE_VISIBILITY_GROUP_CREATE_DTO_VALIDATE_FUNCTION: ValidateFunction<IUserDataStorageVisibilityGroupCreateDTO> =
  AJV.compile(USER_DATA_STORAGE_VISIBILITY_GROUP_CREATE_DTO_JSON_SCHEMA);
