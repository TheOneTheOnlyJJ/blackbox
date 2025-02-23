import { App } from "@main/App";

// TODO: ENCRYPT USER DATA STORAGE CONFIG
// TODO: Explore RBAC user data storage access
// TODO: Wipe RSA keys after IPC TLS is initialised, create new ones every time a new window gets made
// TODO: Decide when to do logging properly. Do not bloat the log file
App.getInstance().run();
