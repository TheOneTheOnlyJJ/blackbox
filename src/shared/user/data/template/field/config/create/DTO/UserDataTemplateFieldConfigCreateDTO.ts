import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldType } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { JSONSchemaType } from "ajv";
import {
  IUserDataTemplateIntegerFieldConfigCreateDTO,
  USER_DATA_TEMPLATE_INTEGER_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA
} from "./implementations/integer/UserDataTemplateIntegerFieldConfigCreateDTO";
import {
  IUserDataTemplateRealFieldConfigCreateDTO,
  USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA
} from "./implementations/real/UserDataTemplateRealFieldConfigCreateDTO";
import {
  IUserDataTemplateTextFieldConfigCreateDTO,
  USER_DATA_TEMPLATE_TEXT_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA
} from "./implementations/text/UserDataTemplateTextFieldConfigCreateDTO";

export interface IUserDataTemplateFieldConfigCreateDTOMap {
  [USER_DATA_TEMPLATE_FIELD_TYPES.integer]: IUserDataTemplateIntegerFieldConfigCreateDTO;
  [USER_DATA_TEMPLATE_FIELD_TYPES.real]: IUserDataTemplateRealFieldConfigCreateDTO;
  [USER_DATA_TEMPLATE_FIELD_TYPES.text]: IUserDataTemplateTextFieldConfigCreateDTO;
}
export type UserDataTemplateFieldConfigCreateDTO = IUserDataTemplateFieldConfigCreateDTOMap[keyof IUserDataTemplateFieldConfigCreateDTOMap];

type UserDataTemplateFieldConfigCreateDTOJSONSchemaMap = {
  [K in UserDataTemplateFieldType]: JSONSchemaType<IUserDataTemplateFieldConfigCreateDTOMap[K]>;
};
export const USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_MAP: UserDataTemplateFieldConfigCreateDTOJSONSchemaMap = {
  [USER_DATA_TEMPLATE_FIELD_TYPES.integer]: USER_DATA_TEMPLATE_INTEGER_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA,
  [USER_DATA_TEMPLATE_FIELD_TYPES.real]: USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA,
  [USER_DATA_TEMPLATE_FIELD_TYPES.text]: USER_DATA_TEMPLATE_TEXT_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA
} as const;

export const USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<UserDataTemplateFieldConfigCreateDTO> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<UserDataTemplateFieldConfigCreateDTO>[]>(
      (
        accumulator: JSONSchemaType<UserDataTemplateFieldConfigCreateDTO>[],
        currentValue: string
      ): JSONSchemaType<UserDataTemplateFieldConfigCreateDTO>[] => {
        accumulator.push(
          USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_MAP[currentValue as keyof UserDataTemplateFieldConfigCreateDTOJSONSchemaMap]
        );
        return accumulator;
      },
      []
    )
} as const;
