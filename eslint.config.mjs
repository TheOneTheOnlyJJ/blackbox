import globals from "globals";
import eslint from "@eslint/js";
import tseslint, { parser as tsParser } from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";

export default tseslint.config(
  {
    files: ["./src/**/*.{js,jsx,ts,tsx}"]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  reactPlugin.configs.flat.recommended,
  {
    rules: {
      "react/react-in-jsx-scope": "off"
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ["./tsconfig.json", "./tsconfig.node.json", "./tsconfig.web.json"]
      },
      globals: {
        ...globals.node,
        ...globals.serviceworker,
        ...globals.browser
      }
    }
  }
);
