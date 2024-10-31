import globals from "globals";
import eslint from "@eslint/js";
import tseslint, { parser as tsParser } from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default tseslint.config(
  {
    // Include everything in src
    files: ["./src/**/*.{js,cjs,mjs,jsx,mjsx,ts,tsx,mtsx}"]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  {
    plugins: {
      "react-hooks": reactHooksPlugin
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      ...reactHooksPlugin.configs.recommended.rules
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ["./tsconfig.json", "./tsconfig.main.json", "./tsconfig.preload.json", "./tsconfig.renderer.json"]
      },
      globals: {
        ...globals.node,
        ...globals.serviceworker,
        ...globals.browser
      }
    }
  },
  {
    // Disable type checking for all non-TS files
    files: ["**/*.{js,cjs,mjs,jsx,mjsx}"],
    extends: [tseslint.configs.disableTypeChecked]
  }
);
