import Ajv from "ajv";
import addFormats from "ajv-formats";

export const AJV: Ajv = new Ajv({ strict: true });
addFormats(AJV);
