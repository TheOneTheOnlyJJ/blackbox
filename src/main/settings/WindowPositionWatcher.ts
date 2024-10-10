import { LogFunctions } from "electron-log";
import { BrowserWindow, Rectangle } from "electron/main";

export enum WindowState {
  FullScreen = "fullscreen",
  Maximized = "maximized",
  Minimized = "minimized"
}

export type WindowPosition = Rectangle | WindowState;

export class WindowPositionWatcher {
  private readonly logger: LogFunctions;
  private updateWindowPositionTimeout: null | NodeJS.Timeout;
  private readonly UPDATE_WINDOW_POSITION_TIMEOUT_DELAY_MS: number;

  public constructor(logger: LogFunctions, timeoutDelay = 500) {
    this.logger = logger;
    this.logger.debug(`Initialising new Window Position Watcher with timeout delay: "${timeoutDelay.toString()}".`);
    this.updateWindowPositionTimeout = null;
    this.UPDATE_WINDOW_POSITION_TIMEOUT_DELAY_MS = timeoutDelay;
  }

  public watchWindowPosition(window: BrowserWindow, onWindowPositionChange: (position: WindowPosition) => void): void {
    this.logger.debug("Starting watching window.");
    window.on("move", () => {
      this.onWindowBoundsChanged(window, onWindowPositionChange);
    });
    window.on("resize", () => {
      this.onWindowBoundsChanged(window, onWindowPositionChange);
    });
  }

  private onWindowBoundsChanged(window: BrowserWindow, onWindowPositionChange: (position: WindowPosition) => void): void {
    // Move and resize events fire very often while the window is moving
    // Debounce window position updates
    if (this.updateWindowPositionTimeout !== null) {
      clearTimeout(this.updateWindowPositionTimeout);
    }
    this.updateWindowPositionTimeout = setTimeout(() => {
      const NEW_WINDOW_POSITION: WindowPosition = this.getNewWindowPosition(window);
      this.logger.silly(
        `New window position: ${typeof NEW_WINDOW_POSITION === "string" ? `"${NEW_WINDOW_POSITION}"` : JSON.stringify(NEW_WINDOW_POSITION, null, 2)}.`
      );
      onWindowPositionChange(NEW_WINDOW_POSITION);
    }, this.UPDATE_WINDOW_POSITION_TIMEOUT_DELAY_MS);
  }

  private getNewWindowPosition(window: BrowserWindow): WindowPosition {
    this.logger.debug("Getting new window position.");
    let newWindowPosition: WindowPosition;
    if (window.isFullScreen()) {
      newWindowPosition = WindowState.FullScreen;
    } else if (window.isMaximized()) {
      newWindowPosition = WindowState.Maximized;
    } else if (window.isMinimized()) {
      newWindowPosition = WindowState.Minimized;
    } else {
      newWindowPosition = window.getBounds();
    }
    return newWindowPosition;
  }
}
