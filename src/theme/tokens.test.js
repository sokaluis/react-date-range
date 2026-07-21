import fs from 'fs';
import path from 'path';

describe('opt-in design token stylesheet', () => {
  const rootDir = path.resolve(__dirname, '..', '..');
  const packageJsonPath = path.join(rootDir, 'package.json');
  const variablesPath = path.join(rootDir, 'src', 'theme', 'variables.css');
  const tokensPath = path.join(rootDir, 'src', 'theme', 'tokens.css');
  const stylesPath = path.join(rootDir, 'src', 'styles.scss');
  const defaultThemePath = path.join(rootDir, 'src', 'theme', 'default.scss');

  const requiredTokens = [
    '--rdr-color-primary',
    '--rdr-color-on-primary',
    '--rdr-color-surface',
    '--rdr-color-on-surface',
    '--rdr-color-muted',
    '--rdr-color-border',
    '--rdr-color-today',
    '--rdr-space-xs',
    '--rdr-space-sm',
    '--rdr-space-md',
    '--rdr-space-lg',
    '--rdr-radius-sm',
    '--rdr-radius-md',
  ];

  test('package exports both the preferred variables.css and backwards-compatible tokens.css alias', () => {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    expect(packageJson.exports['./theme/variables.css']).toBe('./dist/theme/variables.css');
    expect(packageJson.exports['./theme/tokens.css']).toBe('./dist/theme/tokens.css');
  });

  test('build:css packages both variables.css and tokens.css into dist', () => {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    expect(packageJson.scripts['build:css']).toContain('src/theme/variables.css:dist/theme/variables.css');
    expect(packageJson.scripts['build:css']).toContain('src/theme/tokens.css:dist/theme/tokens.css');
  });

  test('variables.css is the canonical source for design tokens', () => {
    const variablesCss = fs.readFileSync(variablesPath, 'utf-8');
    const tokensCss = fs.readFileSync(tokensPath, 'utf-8');

    expect(variablesCss).toBe(tokensCss);
  });

  test('defines every required color, space, and radius custom property', () => {
    const variablesCss = fs.readFileSync(variablesPath, 'utf-8');

    requiredTokens.forEach(token => {
      expect(variablesCss).toMatch(new RegExp(`${token}\\s*:`));
    });
  });

  test('maps selected UI to the primary token only when this stylesheet is imported', () => {
    const variablesCss = fs.readFileSync(variablesPath, 'utf-8');

    expect(variablesCss).toMatch(/\.rdrSelected,\s*\.rdrInRange,\s*\.rdrStartEdge,\s*\.rdrEndEdge\s*{[^}]*color:\s*var\(--rdr-color-primary\)/s);
  });

  test('is not imported by the structural or default theme stylesheets', () => {
    const stylesCss = fs.readFileSync(stylesPath, 'utf-8');
    const defaultThemeCss = fs.readFileSync(defaultThemePath, 'utf-8');

    expect(stylesCss).not.toContain('variables.css');
    expect(stylesCss).not.toContain('tokens.css');
    expect(defaultThemeCss).not.toContain('variables.css');
    expect(defaultThemeCss).not.toContain('tokens.css');
  });
});
