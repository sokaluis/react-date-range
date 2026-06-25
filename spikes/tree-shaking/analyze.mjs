/**
 * Deterministic tree-shaking analysis using esbuild.
 * 
 * Compares what gets included when importing only Calendar vs DateRangePicker.
 */
import * as esbuild from 'esbuild';

const LIB_PATH = new URL('../../dist/index.mjs', import.meta.url).pathname;

// Minimal entry points that consume the library
const CALENDAR_ENTRY = `
import { Calendar } from './dist/index.mjs';
console.log(Calendar);
`;

const DATERANGEPICKER_ENTRY = `
import { DateRangePicker } from './dist/index.mjs';
console.log(DateRangePicker);
`;

async function analyze(name, content, externalDeps) {
  const result = await esbuild.build({
    stdin: {
      contents: content,
      resolveDir: process.cwd(),
      sourcefile: 'entry.js',
    },
    bundle: true,
    minify: false,
    treeShaking: true,
    write: false,
    format: 'esm',
    external: externalDeps,
    metafile: true,
  });

  const output = result.outputFiles[0].text;
  const size = Buffer.byteLength(output, 'utf8');

  // Check which exports appear in the output
  const exports = ['Calendar', 'DateRange', 'DateRangePicker', 'DefinedRange', 'createStaticRanges', 'defaultStaticRanges', 'defaultInputRanges'];
  const present = exports.filter((name) => output.includes(name));

  console.log(`\n=== ${name} ===`);
  console.log(`Output size: ${size.toLocaleString()} bytes (${(size / 1024).toFixed(1)} KB)`);
  console.log(`Exports present: ${present.join(', ')}`);
  console.log(`Exports absent: ${exports.filter((n) => !present.includes(n)).join(', ')}`);

  return { name, size, present, meta: result.metafile };
}

async function main() {
  const external = ['react', 'react-dom', 'prop-types', 'classnames', 'react-list', 'shallow-equal', 'date-fns'];

  // --- Test with current package (sideEffects: ["*.css"]) ---
  // Note: esbuild uses --tree-shaking=true, not package.json sideEffects.
  // The sideEffects field affects Rollup/Webpack module-level pruning, not esbuild intra-file DCE.
  console.log('═══════════════════════════════════════════');
  console.log('esbuild analysis (current: bundle=true, sideEffects=["*.css"])');
  console.log('═══════════════════════════════════════════');

  const cal1 = await analyze('Calendar-only', CALENDAR_ENTRY, external);
  const drp1 = await analyze('DateRangePicker', DATERANGEPICKER_ENTRY, external);

  const diff1 = drp1.size - cal1.size;
  console.log(`\n--- Delta ---`);
  console.log(`Size difference: ${diff1 > 0 ? '+' : ''}${diff1.toLocaleString()} bytes (${(diff1 / 1024).toFixed(1)} KB)`);
  console.log(`Tree-shaking effective: ${diff1 > 1024 ? 'YES (significant diff)' : 'NO (negligible diff)'}`);
}

main().catch(console.error);
