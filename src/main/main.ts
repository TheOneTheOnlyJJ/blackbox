import { App } from "@main/App";

// TODO: Generate user data storage visibility group password salt when adding new user and save to user account storage
// TODO: Hash all new user data storage visibility groups with that salt
// TODO: Hash password from visibility group open request with that salt aswell
// TODO: When opening, decrypt all visibility groups and compare hashes
// TODO: When hashes match, return visibility groups to User Manager
// TODO: Send update to renderer, which needs to have listener for open visibility groups
// TODO: Get all user data storage configs that have the same visibility group ID as the ones opened and send them to renderer as diff
// TODO: Filter data storage configs based on open visibility groups
// TODO: Make it impossible to name a visibility group "Public" (no matter the casing)
// TODO: Add ability to close visibility groups, send diff to renderer with removed data storages
// TODO: Check all the related code

// TODO: Clear open visibility groups on sign in/up/out
// TODO: Close open visibility groups

// TODO: Rename create to createRequest? Make a new requests folder?
// TODO: Edit & delete user data storage configs from frontend
// TODO: Explore RBAC user data storage access
// TODO: Decide when to do logging properly. Do not bloat the log file
App.getInstance().run();
