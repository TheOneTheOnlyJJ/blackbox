import { JSONSchemaType } from "ajv/dist/types/json-schema";
import { USER_SIGN_IN_DATA_JSON_SCHEMA, IUserSignInData } from "@shared/user/account/UserSignInData";

// TODO: Make this clear, with DTO
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IUserSignInInputData extends IUserSignInData {}

export const USER_SIGN_IN_INPUT_DATA_JSON_SCHEMA: JSONSchemaType<IUserSignInInputData> = USER_SIGN_IN_DATA_JSON_SCHEMA;
