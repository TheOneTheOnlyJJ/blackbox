import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

const PATH_ALIASES: Record<string, string> = {
  main: resolve(__dirname, "src", "main"),
  preload: resolve(__dirname, "src", "preload"),
  renderer: resolve(__dirname, "src", "renderer"),
  shared: resolve(__dirname, "src", "shared")
};

export default defineConfig({
  main: {
    resolve: {
      alias: {
        "@main": PATH_ALIASES.main,
        "@shared": PATH_ALIASES.shared
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    resolve: {
      alias: {
        "@main": PATH_ALIASES.main,
        "@preload": PATH_ALIASES.preload,
        "@shared": PATH_ALIASES.shared
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": PATH_ALIASES.renderer,
        "@shared": PATH_ALIASES.shared
      }
    },
    plugins: [react()]
  }
});
