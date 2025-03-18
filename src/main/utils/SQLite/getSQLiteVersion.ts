import { Database } from "better-sqlite3";

interface ISQLiteVersion {
  version: string;
}

export const getSQLiteVersion = (db: Database): string => {
  return (db.prepare("SELECT sqlite_version() AS version").get() as ISQLiteVersion).version;
};
