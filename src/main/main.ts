import { App } from "@main/App";

// TODO: ENCRYPT USER DATA STORAGE CONFIG
// TODO: Log INSIDE functions everywhere where possible
// TODO: Add logging middleware to electron IPC calls
// TODO: Rename add/new to create where necessary (addUser, addStorage, etc.)
// TODO: After renaming, check ALL the code for wrongly named logs, variables, functions
// TODO: Explore RBAC user data storage access
// TODO: Check IDs to be unique in the DB for user, storages, everything
App.getInstance().run();
