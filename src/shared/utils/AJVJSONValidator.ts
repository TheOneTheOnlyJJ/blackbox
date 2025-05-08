import Ajv, { Options } from "ajv";
import addFormats from "ajv-formats";

export const AJV_OPTIONS: Options = {
  strict: true
};

export const AJV: Ajv = new Ajv(AJV_OPTIONS);
addFormats(AJV);

// TODO: Delete this; Used to find incorrect schemas
// const originalCompile = AJV.compile.bind(AJV);

// AJV.compile = (schema: any) => {
//   try {
//     console.log("Compiling schema:", schema);
//     return originalCompile(schema);
//   } catch (err) {
//     console.error("Error compiling schema:", JSON.stringify(schema, null, 2), err);
//     throw err;
//   }
// };
