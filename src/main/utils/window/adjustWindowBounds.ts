import { LogFunctions } from "electron-log";
import { Rectangle } from "electron/main";

export function adjustWindowBounds(screenBounds: Rectangle, windowBounds: Rectangle, logger: LogFunctions): Rectangle {
  let newWidth: number;
  let newHeight: number;
  let newX: number;
  let newY: number;
  // Ensure window is not wider than the screen
  if (windowBounds.width > screenBounds.width) {
    logger.silly("Window width greater than screen width. Setting to screen width.");
    newWidth = screenBounds.width;
  } else {
    logger.silly("Window width smaller than screen width. No change.");
    newWidth = windowBounds.width;
  }
  // Ensure window is not taller than the screen
  if (windowBounds.height > screenBounds.height) {
    logger.silly("Window height greater than screen height. Setting to screen height.");
    newHeight = screenBounds.height;
  } else {
    logger.silly("Window height smaller than screen height. No change.");
    newHeight = windowBounds.height;
  }
  // Ensure no leftwards overflow
  if (windowBounds.x < screenBounds.x) {
    logger.silly("Left window border extends beyond left screen edge. Setting to left screen edge.");
    newX = screenBounds.x;
  } else {
    logger.silly("Left window border inside screen area. No change.");
    newX = windowBounds.x;
  }
  // Ensure no rightwards overflow
  if (windowBounds.x + windowBounds.width > screenBounds.x + screenBounds.width) {
    logger.silly("Right window border extends beyond right screen edge. Setting to right screen edge.");
    newX = screenBounds.x + screenBounds.width - newWidth;
  } else {
    logger.silly("Right window border inside screen area. No change.");
  }
  // Ensure no upwards overflow
  if (windowBounds.y < screenBounds.y) {
    logger.silly("Top window border extends beyond top screen edge. Setting to top screen edge.");
    newY = screenBounds.y;
  } else {
    logger.silly("Top window border inside screen area. No change.");
    newY = windowBounds.y;
  }
  // Ensure no downwards overflow
  if (windowBounds.y + windowBounds.height > screenBounds.y + screenBounds.height) {
    logger.silly("Bottom window border extends beyond bottom screen edge. Setting to bottom screen edge.");
    newY = screenBounds.y + screenBounds.height - newHeight;
  } else {
    logger.silly("Bottom window border inside screen area. No change.");
  }

  // Final adjustment to ensure dimensions are correctly set within the screen bounds
  // This accounts for potential rounding issues
  newWidth = Math.min(newWidth, screenBounds.width);
  newHeight = Math.min(newHeight, screenBounds.height);

  return { x: newX, y: newY, width: newWidth, height: newHeight };
}
