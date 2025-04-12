import { JSONSchemaType, ValidateFunction } from "ajv";
import { USER_DATA_BOX_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS } from "../UserDataBoxConfigCreateConstants";
import { AJV } from "@shared/utils/AJVJSONValidator";

export interface IUserDataBoxConfigCreateDTO {
  storageId: string;
  name: string;
  description: string | null;
}

export const USER_DATA_BOX_CONFIG_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<IUserDataBoxConfigCreateDTO> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    storageId: { type: "string", ...USER_DATA_BOX_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.storageId },
    name: { type: "string", ...USER_DATA_BOX_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.name },
    description: {
      type: "string",
      ...USER_DATA_BOX_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.description,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    }
  },
  required: ["name", "storageId", "description"],
  additionalProperties: false
} as const;

export const isValidUserDataBoxConfigCreateDTO: ValidateFunction<IUserDataBoxConfigCreateDTO> = AJV.compile(
  USER_DATA_BOX_CONFIG_CREATE_DTO_JSON_SCHEMA
);
