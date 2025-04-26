import { App } from "@main/App";

// TODO: Add identifier types for all User Data types
// TODO: Encrypt & decrypt box content with visibility group encryption key
// TODO: Rename create to createRequest? Make a new requests folder?
// TODO: Make visibility group open request shared?
// TODO: Rename visibility group to just group. Rename open to unlocked/available?
// TODO: Add User Data Box Groups
// TODO: Make groups be one of public/hidden/secret. Rename default group to something like default/ungrouped
// TODO: Edit & delete user data storage configs from frontend
// TODO: Chack name availability for all WhateverNameAvailabilityRequest on the backend aswell before adding whatever
// TODO: Refactor User Facade to use an event-driven architecture, investigate better context isolation/dependency injection methods
App.getInstance().run();
