# Tree-shaking Spike

> Verifica si `react-date-range-modern` es tree-shakeable: ¿importar solo `Calendar` excluye componentes no usados como `DateRangePicker`, `DefinedRange`, etc.?

## TL;DR — Veredicto

**Tree-shaking NO funciona con el build actual (`bundle: true`).**

Todos los 7 exports (`Calendar`, `DateRange`, `DateRangePicker`, `DefinedRange`, `createStaticRanges`, `defaultStaticRanges`, `defaultInputRanges`) se incluyen siempre, sin importar cuál importe el consumidor. La diferencia de tamaño entre importar solo `Calendar` vs `DateRangePicker` es ~54 bytes (~0.1%).

**Causa raíz**: `tsup` configura `bundle: true`, que concatena todo el source en un solo archivo (`dist/index.mjs`). Dentro de ese archivo, los bundlers no pueden eliminar `var` declarations de clases que extienden `React.Component` porque tienen efectos secundarios a nivel de módulo.

**Impacto práctico**: La librería completa son 57 KB (gzipped ~15 KB). Para Alpha 0/1, el overhead de incluir componentes no usados es insignificante. Se arreglará antes de Beta 1.0.

**Fix aplicado ahora**: Se agregó `"sideEffects": ["*.css"]` a `package.json` para que los bundlers no eliminen incorrectamente los imports de CSS (los archivos CSS sí tienen side effects: inyectan estilos).

## Fixtures

### 1. `calendar-only/` — Importa solo `Calendar`

```js
import { Calendar } from 'react-date-range-modern';
import 'react-date-range-modern/styles.css';
```

### 2. `daterangepicker/` — Importa `DateRangePicker`

```js
import { DateRangePicker } from 'react-date-range-modern';
import 'react-date-range-modern/styles.css';
```

### 3. `analyze.mjs` — Análisis determinístico con esbuild

```bash
node spikes/tree-shaking/analyze.mjs
```

Compara qué exports se incluyen al hacer bundle solo de la librería (excluyendo React, date-fns, etc.).

## Resultados

### Vite build (producción, incluye React + date-fns)

| Fixture | JS bundle | gzip |
|---------|-----------|------|
| Calendar-only | 284.28 KB | 84.43 KB |
| DateRangePicker | 284.40 KB | 84.47 KB |
| **Delta** | **+0.12 KB** | **+0.04 KB** |

### esbuild analysis (solo librería, sin React/date-fns)

| Fixture | Size | Todos los exports presentes? |
|---------|------|------------------------------|
| Calendar-only | 56,074 bytes (54.8 KB) | ✅ Sí — los 7 |
| DateRangePicker | 56,128 bytes (54.8 KB) | ✅ Sí — los 7 |
| **Delta** | **+54 bytes** | **Sin diferencia** |

## Comandos

```bash
# Setup
cd spikes/tree-shaking/calendar-only && npm install
cd spikes/tree-shaking/daterangepicker && npm install

# Build (producción)
cd spikes/tree-shaking/calendar-only && npm run build
cd spikes/tree-shaking/daterangepicker && npm run build

# Análisis determinístico
cd ../..  # raíz del proyecto
node spikes/tree-shaking/analyze.mjs

# Comparar tamaños
ls -la spikes/tree-shaking/calendar-only/dist/assets/*.js
ls -la spikes/tree-shaking/daterangepicker/dist/assets/*.js
```

## Análisis: por qué no funciona

### `bundle: true` en tsup

```ts
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.js'],
  bundle: true,        // ← causa raíz
  splitting: false,    // ← refuerza single-file
  // ...
});
```

Esto produce un solo archivo `dist/index.mjs` de 1613 líneas con todos los componentes concatenados:

```js
// dist/index.mjs (simplificado)
var DayCell = class extends Component { /* ... */ };
var Calendar = class extends PureComponent3 { /* ... */ };
var DateRange = class extends Component2 { /* ... */ };
var DefinedRange = class extends Component4 { /* ... */ };
var DateRangePicker = class extends Component5 { /* ... */ };

export {
  Calendar_default as Calendar,
  DateRange_default as DateRange,
  DateRangePicker_default as DateRangePicker,
  DefinedRange_default as DefinedRange,
  createStaticRanges,
  defaultInputRanges,
  defaultStaticRanges
};
```

### Por qué los bundlers no pueden tree-shakear

1. **`var` declarations de clases**: `var DayCell = class extends Component { ... }` tiene side effects — `extends Component` referencia `React.Component`, que es una expresión evaluada en module scope.

2. **esbuild/Rollup son conservadores**: No pueden probar que eliminar estas declaraciones no afecta el comportamiento del módulo.

3. **`sideEffects` no ayuda acá**: El campo `sideEffects` le dice al bundler si puede saltar módulos ENTEROS, pero acá todo está en UN SOLO módulo.

### Solución futura (Beta 1.0)

1. Cambiar `bundle: false` en tsup — compila cada archivo por separado, preservando el grafo de imports.
2. Agregar `"sideEffects": false` — permite que los bundlers eliminen módulos enteros no usados.
3. Alternativa: entry points separados (`./calendar`, `./date-range-picker`, etc.).

```ts
// tsup.config.ts (futuro)
export default defineConfig({
  entry: ['src/index.js'],
  bundle: false,        // ← no concatenar
  format: ['cjs', 'esm'],
  // ...
});
```

```json
// package.json (futuro)
{
  "sideEffects": false,
  "exports": {
    ".": { "import": "./dist/index.mjs", "require": "./dist/index.js" },
    "./calendar": { "import": "./dist/components/Calendar/index.mjs" }
  }
}
```

## CSS side effects

El campo `"sideEffects": ["*.css"]` es necesario para que los bundlers NO eliminen los imports de CSS. Sin esto, un bundler agresivo podría eliminar:

```js
import 'react-date-range-modern/styles.css'; // ← podría ser eliminado
```

Los archivos CSS sí tienen side effects observables (inyectan estilos en el DOM).

## Riesgos y deuda

- ⚠️ **Tree-shaking no funciona para el bundle JS** — documentado, no blocker para Alpha.
- ⚠️ **Overhead ~57 KB** — aceptable para Alpha 0/1, debe arreglarse antes de Beta 1.0.
- ✅ **`sideEffects: ["*.css"]`** aplicado — protege los imports de CSS.
- 🔜 **Fix real**: `bundle: false` + `sideEffects: false` en la migración de build de Beta.
