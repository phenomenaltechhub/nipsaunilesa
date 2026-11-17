import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Independent native browser modules, outside the Next.js application.
  { files: ['backend/ui/**/*.mjs'], rules: { '@next/next/no-location-assign-relative-destination': 'off' } },
  { files: ['backend/ui/**/*.mjs'], languageOptions: { globals: Object.fromEntries(['window','document','location','navigator','fetch','URL','Blob','Option','crypto','BroadcastChannel','structuredClone','setTimeout','clearTimeout','setInterval','clearInterval','btoa'].map(name => [name, 'readonly'])) }, rules: { 'no-undef': 'error' } },
  { files: ['backend/src/**/*.mjs'], languageOptions: { globals: { Buffer: 'readonly' } }, rules: { 'no-undef': 'error' } },
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
