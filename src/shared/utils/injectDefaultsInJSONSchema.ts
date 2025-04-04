import { JSONSchemaType } from "ajv";

export const injectDefaultsInJSONSchema = <T>(schema: JSONSchemaType<T>, defaults: Partial<T>): JSONSchemaType<T> => {
  const SCHEMA_WITH_DEFAULTS: JSONSchemaType<T> = structuredClone(schema);
  const SCHEMA_PROPERTIES: Record<string, object> = SCHEMA_WITH_DEFAULTS.properties as Record<string, object>;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (SCHEMA_PROPERTIES !== null && typeof SCHEMA_PROPERTIES === "object") {
    for (const KEY in defaults) {
      if (Object.hasOwn(SCHEMA_PROPERTIES, KEY)) {
        Object.assign(SCHEMA_PROPERTIES[KEY], { ...SCHEMA_PROPERTIES[KEY], default: defaults[KEY] as unknown });
      }
    }
  }
  return SCHEMA_WITH_DEFAULTS;
};
