import { ISecuredPassword, SECURED_PASSWORD_JSON_SCHEMA } from "@main/utils/encryption/SecuredPassword";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IPrivateStorageSecuredUserDataStorageVisibilityGroup {
  name: string;
  securedPassword: ISecuredPassword;
  description: string | null;
  AESKeySalt: string;
}

export const PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_JSON_SCHEMA: JSONSchemaType<IPrivateStorageSecuredUserDataStorageVisibilityGroup> =
  {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      name: { type: "string", title: "Name" },
      securedPassword: SECURED_PASSWORD_JSON_SCHEMA,
      description: {
        type: "string",
        title: "Description",
        nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
      },
      AESKeySalt: {
        type: "string",
        contentEncoding: "base64"
      }
    },
    required: ["name", "securedPassword", "description", "AESKeySalt"],
    additionalProperties: false
  } as const;

export const PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_VALIDATE_FUNCTION: ValidateFunction<IPrivateStorageSecuredUserDataStorageVisibilityGroup> =
  AJV.compile(PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_JSON_SCHEMA);
