import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { USER_DATA_TEMPLATE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS } from "../UserDataTemplateConfigCreateConstants";
import {
  USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA,
  UserDataTemplateFieldConfigCreateDTO
} from "../../../field/config/create/DTO/UserDataTemplateFieldConfigCreateDTO";

export interface IUserDataTemplateConfigCreateDTO {
  storageId: string;
  boxId: string;
  name: string;
  description: string | null;
  fields: UserDataTemplateFieldConfigCreateDTO[];
}

export const USER_DATA_TEMPLATE_CONFIG_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateConfigCreateDTO> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    storageId: { type: "string", ...USER_DATA_TEMPLATE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.storageId },
    boxId: { type: "string", ...USER_DATA_TEMPLATE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.boxId },
    name: { type: "string", ...USER_DATA_TEMPLATE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.name },
    description: {
      type: "string",
      ...USER_DATA_TEMPLATE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.description,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    fields: { type: "array", items: USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA, minItems: 1 }
  },
  required: ["storageId", "boxId", "name", "description", "fields"],
  additionalProperties: false
} as const;

export const isValidUserDataTemplateConfigCreateDTO: ValidateFunction<IUserDataTemplateConfigCreateDTO> = AJV.compile(
  USER_DATA_TEMPLATE_CONFIG_CREATE_DTO_JSON_SCHEMA
);
