import { Database } from "better-sqlite3";

type SQLiteJournalModePragmaResult = undefined | null | string;

export const getSQLiteJournalModePragmaResult = (db: Database): string => {
  return String(db.pragma("journal_mode", { simple: true }) as SQLiteJournalModePragmaResult);
};
