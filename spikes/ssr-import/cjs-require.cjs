/**
 * SSR/import safety check — CJS (require).
 *
 * Verifies that requiring the CJS build of react-date-range-modern in Node.js
 * does NOT throw due to module-scope `window`/`document`/`navigator` access.
 *
 * Run: node cjs-require.cjs
 */

console.log("Attempting CJS require of react-date-range-modern…");

try {
  const mod = require("react-date-range-modern");

  const exportedKeys = Object.keys(mod).sort();
  console.log(`✅ CJS require succeeded.`);
  console.log(`   Exports: ${exportedKeys.join(", ")}`);

  if (exportedKeys.length === 0) {
    console.error("❌ Empty exports — expected at least DateRange, Calendar, DateRangePicker");
    process.exit(1);
  }
} catch (err) {
  console.error("❌ CJS require FAILED:", err.message);
  console.error("   (Check for module-scope DOM access or missing dependencies.)");
  process.exit(1);
}
