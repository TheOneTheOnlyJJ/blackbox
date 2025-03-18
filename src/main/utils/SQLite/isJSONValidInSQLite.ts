import { Database } from "better-sqlite3";
import { LogFunctions } from "electron-log";

export const isJSONValidInSQLite = (db: Database, json: object | string, logger: LogFunctions | null, jsonPurposeToLog?: string): boolean => {
  if (typeof json === "object") {
    json = JSON.stringify(json, null, 2);
  }
  logger?.log(`Performing SQLite JSON validation${jsonPurposeToLog === undefined ? "" : ` on ${jsonPurposeToLog} JSON data`}.`);
  const SQL_QUERY = "SELECT json_valid(@json) AS isValid";
  const RESULT = db.prepare(SQL_QUERY).get({ json: json }) as { isValid: 0 | 1 };
  const IS_VALID: boolean = RESULT.isValid === 0 ? false : true;
  logger?.debug(`Valid SQLite JSON: ${IS_VALID.toString()}.`);
  return IS_VALID;
};
