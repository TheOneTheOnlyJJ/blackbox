import { IUser, UserId } from "./../user/IUser";
import { IUserStorage } from "./IUserStorage";
import DatabaseConstructor, { Database } from "better-sqlite3";
import { app } from "electron/main";
import { existsSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { IUserStorageIPCInfo } from "./IUserStorageIPCInfo";

export default class SQLiteUserStorage implements IUserStorage {
  private db: Database;
  readonly storageType = "SQLite";

  constructor(dbDirPath: string, dbFileName: string) {
    console.log(`Running SQLite user storage constructor with database directory path: ${dbDirPath} and database file name: ${dbFileName}.`);
    const DB_FILE_PATH: string = join(dbDirPath, dbFileName);
    if (existsSync(dbDirPath)) {
      console.log(`Found SQLite user database directory path: ${dbDirPath}. Searching for database.`);
    } else {
      console.log(`Could not find SQLite user database directory at path: ${dbDirPath}. Creating directory.`);
      mkdirSync(dbDirPath, { recursive: true });
      console.log(`Created SQLite user database directory at: ${dbDirPath}.`);
    }
    if (existsSync(DB_FILE_PATH)) {
      console.log(`Found SQLite user database at path: ${DB_FILE_PATH}. Opening existing database.`);
    } else {
      console.log(`Could not find SQLite user database at path: ${DB_FILE_PATH}. Creating new empty database.`);
    }
    console.log("Running SQLite constructor...");
    this.db = new DatabaseConstructor(DB_FILE_PATH);
    console.log("SQLite constructor completed.");
  }

  addUser(user: IUser): boolean {
    return true;
  }

  deleteUser(userId: UserId): boolean {
    return true;
  }

  deleteUsers(userIds: UserId[]): boolean {
    return true;
  }

  getUser(userId: UserId): IUser {
    return {
      id: "",
      username: "test",
      password: "test"
    };
  }

  getUsers(userIds: UserId[]): IUser[] {
    return [
      {
        id: "",
        username: "test",
        password: "test"
      }
    ];
  }

  getAllUsers(): IUser[] {
    return [
      {
        id: "",
        username: "test",
        password: "test"
      }
    ];
  }

  getUserCount(): number {
    return 0;
  }

  isIdValid(id: UserId): boolean {
    return false;
  }

  isLocal(): boolean {
    return true;
  }

  close(): boolean {
    console.log("Closing SQLite user storage database.");
    this.db.close();
    return true;
  }

  getIPCInfo(): IUserStorageIPCInfo {
    return {
      storageType: this.storageType,
      isLocal: this.isLocal()
    };
  }
}
