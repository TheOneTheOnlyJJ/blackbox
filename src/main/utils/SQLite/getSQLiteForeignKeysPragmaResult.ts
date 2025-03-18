import { Database } from "better-sqlite3";

type SQLiteForeignKeysPragmaResult = undefined | null | 0 | 1;

export const getSQLiteForeignKeysPragmaResult = (db: Database): boolean => {
  return Boolean(db.pragma("foreign_keys", { simple: true }) as SQLiteForeignKeysPragmaResult);
};
