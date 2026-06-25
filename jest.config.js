/** @type {import('jest').Config} */
module.exports = {
  // Legacy test suites that import 'enzyme' (not in devDependencies; not React 19 compatible).
  // They are preserved on disk for reference. They should be rewritten or removed when the
  // corresponding components are migrated.
  testPathIgnorePatterns: [
    '/node_modules/',
    'src/components/InputRangeField/index\\.test\\.js$',
    'src/components/DefinedRange/index\\.test\\.js$',
  ],
};
