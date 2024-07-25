import { app, shell, globalShortcut, BrowserWindow } from "electron";
import { join } from "node:path";
import icon from "../../resources/icon.ico?asset";

export function createWindow(window: null | BrowserWindow): null | BrowserWindow {
  window = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    //icon: process.platform === "linux" ? icon : undefined, // TODO: Handle for separate platforms
    icon: icon,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      allowRunningInsecureContent: false
    }
  });

  window.on("closed", () => {
    window = null;
  });

  window.on("ready-to-show", () => {
    console.log("Showing window.");
    window?.show();
  });

  window.webContents.setWindowOpenHandler((details) => {
    shell
      .openExternal(details.url)
      .then(() => {
        console.log("Opened external URL.");
      })
      .catch((err: unknown) => {
        console.log(`Could not open external URL : ${err}!`);
      });
    return { action: "deny" };
  });

  let isDevToolsShortcutRegistered = false;
  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
    window
      .loadURL(process.env.ELECTRON_RENDERER_URL)
      .then(() => {
        console.log(`Loaded page from ENV URL : ${process.env.ELECTRON_RENDERER_URL}.`);
      })
      .catch((err: unknown) => {
        console.log(`Could not load page from ENV URL : ${process.env.ELECTRON_RENDERER_URL}\nError : ${err}!`);
      });
    isDevToolsShortcutRegistered = globalShortcut.register("CmdOrCtrl+F12", () => {
      console.log("DevTools shortcut pressed!");
      window?.webContents.openDevTools({ mode: "detach" });
    });
  } else {
    window
      .loadFile(join(__dirname, "../renderer/index.html"))
      .then(() => {
        console.log("Opened index.html file!");
      })
      .catch((err: unknown) => {
        console.log(`Could not open index.html file : ${err}.`);
      });
  }
  if (isDevToolsShortcutRegistered) {
    console.log("Dev tools shortcut registered.");
  } else {
    console.log("Dev tools shortcut registration failed.");
  }

  return window;
}
