import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This flags the standard "fetch on mount, setState with the result"
      // pattern used throughout this codebase's data-fetching hooks — that's
      // idiomatic React, not a bug, so it's a warning rather than a build
      // failure here.
      "react-hooks/set-state-in-effect": "warn",
      // Flags Date.now() inside useMemo (used for a date-range filter) as
      // "impure" — correct in theory for React Compiler's assumptions, but
      // harmless here since the filter is meant to reflect "now" each time
      // it recomputes, not cache a value across renders.
      "react-hooks/purity": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
