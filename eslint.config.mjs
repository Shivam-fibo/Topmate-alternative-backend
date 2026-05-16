import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import prettierConfig from "eslint-config-prettier";

export default [
  /*
   |--------------------------------------------------------------------------
   | Ignore Files
   |--------------------------------------------------------------------------
   */
  {
    ignores: [
      "dist/**",
      "node_modules/**",
    ],
  },

  ...tseslint.configs.recommended,

  {
    files: ["src/**/*.{ts,tsx}"],

    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },

    plugins: {
      import: importPlugin,
      "unused-imports": unusedImports,
    },

    rules: {
      /*
       |--------------------------------------------------------------------------
       | Unused Imports
       |--------------------------------------------------------------------------
       */
      "unused-imports/no-unused-imports":
        "error",

      /*
       |--------------------------------------------------------------------------
       | Unused Variables
       |--------------------------------------------------------------------------
       */
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
        },
      ],

      /*
       |--------------------------------------------------------------------------
       | Import Order
       |--------------------------------------------------------------------------
       */
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],

          "newlines-between": "always",

          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      /*
       |--------------------------------------------------------------------------
       | TypeScript Rules
       |--------------------------------------------------------------------------
       */
      "@typescript-eslint/consistent-type-imports":
        "warn",

      "@typescript-eslint/no-explicit-any":
        "warn",
    },
  },

  prettierConfig,
];