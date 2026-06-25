/**
 * SSR/import safety check — ESM (import).
 *
 * Verifies that importing the ESM build of react-date-range-modern in Node.js
 * does NOT throw due to module-scope `window`/`document`/`navigator` access.
 *
 * The `createRequire` path resolves via package.json `"main"` field (CJS bundle).
 * We explicitly import `dist/index.mjs` to exercise the ESM build that real
 * ESM bundlers (Vite, Next.js, etc.) resolve via the `"exports"` map.
 *
 * Run: node esm-import.mjs
 */

import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Resolve the package root to get dist/index.mjs
const pkgCjsPath = require.resolve("react-date-range-modern");
// pkgCjsPath is e.g. .../dist/index.js
// Go up to dist/, then up once more to package root
const pkgRoot = resolve(pkgCjsPath, "..", "..");
const esmBuild = resolve(pkgRoot, "dist", "index.mjs");

console.log("CJS resolve (via main):", pkgCjsPath);
console.log("ESM build path:       ", esmBuild);

try {
  const mod = await import(esmBuild);

  const exportedKeys = Object.keys(mod).sort();
  console.log(`✅ ESM import succeeded.`);
  console.log(`   Exports: ${exportedKeys.join(", ")}`);

  if (exportedKeys.length === 0) {
    console.error("❌ Empty exports — expected at least DateRange, Calendar, DateRangePicker");
    process.exit(1);
  }
} catch (err) {
  console.error("❌ ESM import FAILED:", err.message);
  console.error("   (Check for module-scope DOM access or missing dependencies.)");
  process.exit(1);
}
