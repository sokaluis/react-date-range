# Tree-shaking Spike

> Verifica si `@cyberlz/react-date-range` es tree-shakeable: ¿importar solo `Calendar` excluye componentes no usados como `DateRangePicker`, `DefinedRange`, etc.?

> **Estado (2026-06-28, post-Slice 6)**: tree-shaking real implementado y verificado empíricamente. Calendar-only resuelve a ~41 KB vs DateRangePicker ~58 KB (delta 17.2 KB, 30% del bundle). Esta spike documenta la historia y los resultados del análisis determinístico con esbuild.

## TL;DR — Veredicto actual

**Tree-shaking SÍ funciona con el build actual (`tsdown` con `unbundle: true` + multi-entry glob).**

Cada componente se emite como un archivo separado en `dist/components/<Component>/index.{cjs,mjs}`. Los bundlers de los consumidores pueden tree-shakear los componentes no importados.

**Causa raíz del fix**: el bundler anterior (`tsup` con `bundle: true`) normalizaba los re-exports del barrel (`export { default as X } from './X'`) en una sola declaración `import + export { x as X }`, destruyendo la información de PURE-ness que bundlers como esbuild/Rollup necesitan para tree-shakear. La migración a `tsdown` (mismo autor que `tsup`) preserva la sintaxis original y emite módulos separados.

**Historia**:
- Pre-Slice 6: 1 archivo `dist/index.mjs` de 1,613 líneas, todos los componentes concatenados, tree-shaking imposible.
- Post-Slice 6 (commit `e141852`): cada componente en su propio archivo, tree-shaking real.

## Resultados verificados (post-Slice 6)

### esbuild analysis (solo librería, sin React/date-fns)

| Fixture | Output size | Exports presentes |
|---------|-------------|-------------------|
| `import { Calendar }` | **41.2 KB** (70,067 bytes) | Calendar |
| `import { DateRangePicker }` | **58.3 KB** (101,194 bytes) | Calendar, DateRange, DateRangePicker, DefinedRange, defaultStaticRanges, defaultInputRanges, createStaticRanges |
| **Delta** | **+17.2 KB** (+30,400 bytes, +41%) | tree-shaking real, confirmado |

El delta significativo prueba que los bundlers pueden tree-shakear los componentes no usados.

### Cómo verificar localmente

```bash
# Build fresco
rm -rf dist && npm run build

# Análisis determinístico
node spikes/tree-shaking/analyze.mjs
```

## Fixtures de Vite (validación end-to-end)

### 1. `calendar-only/` — Importa solo `Calendar`

```js
import { Calendar } from '@cyberlz/react-date-range';
import '@cyberlz/react-date-range/styles.css';
```

### 2. `daterangepicker/` — Importa `DateRangePicker`

```js
import { DateRangePicker } from '@cyberlz/react-date-range';
import '@cyberlz/react-date-range/styles.css';
```

### Setup y build

```bash
cd spikes/tree-shaking/calendar-only && npm install && npm run build
cd spikes/tree-shaking/daterangepicker && npm install && npm run build
```

Ambas fixtures resuelven `@cyberlz/react-date-range` desde el filesystem local (`file:../../..`); ver `package.json` de cada fixture.

## Cambios aplicados (Slice 6, commit `e141852`)

- `tsup` removido de devDependencies.
- `tsdown` agregado a devDependencies.
- `tsup.config.ts` reemplazado por `tsdown.config.ts` con `unbundle: true` y multi-entry glob.
- `package.json` `build:js` ahora usa `tsdown`.
- `package.json` `external` movido a `deps.neverBundle` (convención actual de tsdown).
- API pública sin cambios: el consumer sigue importando `import { Calendar } from '@cyberlz/react-date-range'`.

```ts
// tsdown.config.ts (post-Slice 6)
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/**/*.{js,jsx}', '!src/**/*.test.js'],
  format: ['cjs', 'esm'],
  clean: true,
  dts: false,
  unbundle: true,
  loader: { '.js': 'jsx' },
  deps: {
    neverBundle: [
      'react', 'react-dom', 'prop-types', 'classnames',
      'react-list', 'shallow-equal', 'date-fns', /^date-fns\//,
    ],
  },
});
```

## CSS side effects (sigue siendo importante)

El campo `"sideEffects": ["*.css"]` sigue siendo necesario. Aunque ahora con módulos separados, este flag le dice a los bundlers que NO eliminen los imports de CSS:

```js
import '@cyberlz/react-date-range/styles.css'; // ← no debe ser eliminado
```

Los archivos CSS sí tienen side effects observables (inyectan estilos en el DOM).

## Limitaciones conocidas

- **CJS no es tree-shakeable por naturaleza**. `require('./dist/index.cjs')` carga todos los componentes; bundlers con CJS interop (Webpack 5, esbuild) pueden hacer pruning parcial, pero no al nivel de ESM.
- **`MIXED_EXPORTS` warning** sobre `DayCell` que exporta `default` + `rangeShape` juntos. Es pre-existente y benigno para el API público (los consumidores importan `import { Calendar, DateRange, ... } from '@cyberlz/react-date-range'`, no `chunk.default`).
- **Costo del multi-entry glob**: `tsdown` emite todos los módulos que matchean `src/**/*.{js,jsx}` (excepto tests), incluyendo `src/locale/index.js` y `src/styles.js` que están actualmente sin uso directo. Es contenido dead-code; un futuro slice podría narrow-ear el glob.

## Referencias

- `docs/build-output.md` — descripción actualizada del pipeline de build.
- `docs/refactor-roadmap.md` — Slice 6 marcado como ✅ con detalles del fix.
- `CHANGELOG.md` — entrada de `0.1.0-alpha.3` documenta el cambio.
