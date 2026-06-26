# Refactor Roadmap — @cyberlz/react-date-range

> Plan de refactor incremental post-Alpha 0.1. Cada slice es autocontenido, verificable,
> y no rompe la API pública. Leer este documento al retomar el proyecto.

---

## Estado actual (2026-06-26)

| Item | Estado |
|------|--------|
| Alpha publicada en npm | `@cyberlz/react-date-range@0.1.0-alpha.2` (`alpha` dist-tag) |
| Último checkpoint | `v0.1.0-alpha.2` publicado en npm y GitHub Releases |
| GitHub Release | ✅ Etiquetado en `sokaluis/react-date-range` |
| Verificación local | Jest 57/57, `test:ci` 28/28, build, demo typecheck y `npm pack --dry-run` |
| Demo mínima npm-backed | `demo/` — Vite + React 19 + TS, en CI |
| Consumer smoke tests | React 18 ✅, React 19 ✅ (instalado desde registry) |
| Vercel / landing | **Diferido** — se prioriza refactor real sobre docs públicas |
| Prioridad actual | **Refactor de la librería**, próximo slice: tree-shaking real (`bundle: false`) |

---

## Decisión documentada: Vercel diferido, refactor prioritario

El usuario pide enfocarse en mejorar el código de la librería antes de invertir en
presencia pública/docs. Vercel y landing docs no son urgentes. Ver
[`docs-site-plan.md`](docs-site-plan.md) para el plan de deploy cuando corresponda.

---

## Roadmap por slices

### Slice 1 — `DateInput` validation (minDate, maxDate, disabledDates) ✅

**Estado**: Completado y publicado en `0.1.0-alpha.2`.

**Problema**: La grilla visual (`Month` → `DayCell`) respeta `minDate`, `maxDate` y
`disabledDates`. Pero el `DateInput` editable (cuando `editableDateInputs={true}`)
no conoce estas restricciones. Un usuario puede **tipear** una fecha fuera del rango
permitido y el `onChange` la acepta sin rechazo.

> Upstream issue: [#539](https://github.com/hypeserver/react-date-range/pull/539).
> Ver [`docs/upstream-issue-tracker.md`](upstream-issue-tracker.md).

**Objetivo**: Que `DateInput` rechace fechas fuera de `minDate`/`maxDate` y fechas
en `disabledDates`, igual que la grilla.

**Archivos probables**:

| Archivo | Cambio |
|---------|--------|
| `src/components/DateInput/index.js` | Agregar props `minDate`, `maxDate`, `disabledDates` al componente y validar en `update()` antes de llamar `onChange`. |
| `src/components/Calendar/index.js` | Pasar `minDate`, `maxDate`, `disabledDates` como props a `DateInput` en `renderDateDisplay()`. |
| `src/index.d.ts` | Agregar `minDate`, `maxDate`, `disabledDates` a `DateInputProps` (si se exporta; si no, mantener interno). |
| `src/components/DateInput/index.test.js` | **Nuevo** — tests unitarios: fecha válida dentro de rango, fuera de rango, en disabledDates, borde en minDate/maxDate. |
| `Spikes / fixture` | `spikes/dateinput-validation/` — fixture React 19 con `editableDateInputs={true}` y todas las restricciones activas. |

**Riesgos**:

| Riesgo | Mitigación |
|--------|-----------|
| `DateInput` no recibe `disabledDates` en el flujo actual de props | `Calendar` ya los tiene; solo hay que pasarlos en `renderDateDisplay()`. |
| Romper compatibilidad hacia atrás | `minDate`/`maxDate`/`disabledDates` son opcionales; sin ellos, comportamiento idéntico al actual. |
| Validación sincrónica vs asincrónica de `disabledDates` | `disabledDates` es un array chico (no un callback asincrónico). Validación O(n) es aceptable. |
| UX: no hay feedback visual más allá del ⚠ actual | Aceptable para Slice 1. El ⚠ ya existe para fechas inválidas; extenderlo a "fuera de rango" es suficiente. |

**Verificación**:

1. `npm test` — tests unitarios de `DateInput` pasan (nuevos + existentes).
2. Fixture `spikes/dateinput-validation/` — tipear fecha fuera de rango, verificar que `onChange` **no** se llama.
3. Demo `demo/` — verificar visualmente con `editableDateInputs={true}` y `minDate`/`maxDate`.
4. CI verde — `npm run build && npm test` sin regresiones.

**Criterio de aceptación**:

- [ ] `DateInput` recibe `minDate`, `maxDate`, `disabledDates` como props opcionales.
- [ ] `update()` rechaza fechas parseadas que estén fuera de `minDate`–`maxDate`.
- [ ] `update()` rechaza fechas parseadas que coincidan con `disabledDates`.
- [ ] El ⚠ warning se muestra para fechas rechazadas por estas reglas.
- [ ] `Calendar.renderDateDisplay()` pasa las props a `DateInput`.
- [ ] Sin props de restricción, comportamiento idéntico al actual (backward compat).
- [ ] Tests unitarios cubren casos borde.
- [ ] Fixture de spike verifica el flujo end-to-end.
- [ ] Demo sigue funcionando sin cambios.

---

### Slice 2 — `Calendar`: extraer `renderDateDisplay` a componente propio ✅

**Estado**: Completado y publicado en `0.1.0-alpha.2`.

**Problema**: `Calendar` tiene ~650 líneas. `renderDateDisplay()` maneja lógica de
edición, focus, placeholders y renderizado de `DateInput` que no pertenecen al
core del calendario. Extraerlo reduce la superficie de `Calendar` y facilita
testing y mantenimiento.

**Objetivo**: Crear `DateDisplay` como componente separado, sin cambiar la API pública.

**Archivos probables**: `src/components/Calendar/index.js`, `src/components/DateDisplay/index.js` (nuevo), `src/index.js`.

**Dependencia**: Slice 1 (DateInput validation). Hacer este slice después asegura
que `DateDisplay` ya recibe las props de validación correctamente.

---

### Slice 3 — `Calendar`: migrar de `PureComponent` a función + hooks ✅

**Estado**: Completado y publicado en `0.1.0-alpha.2`.

**Problema**: Todos los componentes usan `class` components. Migrar a funciones
con hooks moderniza el código, reduce boilerplate, y facilita未来 refactors.

**Objetivo**: Migrar `Calendar` a función sin cambiar API pública ni comportamiento.

**Riesgo**: Alto. `Calendar` es el componente más complejo (StrictMode fixes,
ReactList, scroll virtual, drag selection). Hacer después de los slices 1-2
asegura que entendemos bien el componente antes de migrarlo.

---

### Slice 4 — `Month` / `DayCell`: migrar a función + hooks ✅

**Estado**: Completado y pusheado a `main` en `3323607`.

**Verificación**: Calendar focused 22/22, Jest completo 57/57. Build no corrido
porque solo se ejecuta con autorización explícita.

**Objetivo**: Migrar componentes hoja a funciones. Bajo riesgo, alto valor
educativo para establecer el patrón de migración.

**Resultado**: `Month` quedó como función; `DayCell` quedó como función con
`useState` para `hover`/`active`; se agregó un seam test mínimo para disabled days
sin cambiar contratos públicos ni comportamiento observable.

---

### Slice 5 — `DateRange` / `DateRangePicker` / `DefinedRange`: migrar a función + hooks ✅

**Estado**: Completado y pusheado a `main` en cadena `stacked-to-main`:
5a `c8ebd65`, 5b `a34f3f4`, 5c `1a5755f`.

**Verificación**: DateRangePicker 3/3, DateRange + DefinedRange 14/14,
Jest completo 68/68, `test:ci` 35/35. Build no corrido porque solo se ejecuta
con autorización explícita.

**Objetivo**: Completar migración de todos los componentes a funciones.

**Resultado**: `DateRange`, `DefinedRange` y `DateRangePicker` quedaron como
componentes con hooks/`forwardRef`, preservando contratos de selección/rango,
props públicas y composición con `Calendar`.

**Split aplicado**: 5a `DateRange` → 5b `DefinedRange` → 5c
`DateRangePicker`, con tests activos para el seam
`DefinedRange` → `DateRangePicker` → `DateRange`.

---

### Slice 6 — Tree-shaking real (`bundle: false`)

**Problema**: `bundle: true` produce un solo archivo; todos los exports se incluyen
siempre (~57 KB fijos). Ver [`docs/build-output.md`](build-output.md) y
[`spikes/tree-shaking/README.md`](../spikes/tree-shaking/README.md).

**Objetivo**: Cambiar a `bundle: false` + `sideEffects: false` para que bundlers
puedan tree-shakear exports no usados.

**Riesgo**: Cambio de build puede romper consumidores si los imports de CSS no
están correctamente marcados como side-effects.

---

### Slices futuros (post-migración completa)

| Slice | Descripción | Fase original |
|-------|------------|---------------|
| Accessibility (ARIA, keyboard nav) | Issues #373, #415, #416 | Phase 3 |
| CSS variables / design tokens | Extraer tokens para stylability | Phase 2 |
| `className` pass-through | Soporte completo de `className` en todos los componentes | Phase 2 |
| Dual skins (classic + simple) | Dos experiencias visuales, un core | Phase 4 |
| RTL support | PR #669 como punto de partida | Phase 4 |

---

## Próxima acción exacta al retomar

```bash
# 1. Leer este documento
cat docs/refactor-roadmap.md

# 2. Verificar estado actual sin build salvo autorización explícita
npm test

# 3. Planificar Slice 6 con SDD: tree-shaking real (`bundle: false`)
#    - Revisar docs/build-output.md y spikes/tree-shaking/README.md
#    - Evaluar impacto de sideEffects/CSS y compatibilidad de consumidores
#    - Aplicar solo después de autorización explícita
#    - Verificar con npm test; build solo si se autoriza para release/checkpoint
```

---

## Qué NO hacer todavía

- ❌ Rewrite total del código (class → function masivo sin slices)
- ❌ Separar core/skins (Phase 4 — muy lejano)
- ❌ Deploy a Vercel (sin landing real no tiene sentido)
- ❌ Nuevas features (time picker, nuevos componentes)
- ❌ Cambiar API pública (rompe drop-in compatibility)
- ❌ Migrar a otro date library (date-fns es la dependencia establecida)
- ❌ Publicar nueva versión en npm (solo después de varios slices verificados)

---

## Referencias a docs existentes

| Documento | Contenido |
|-----------|-----------|
| [`fork-roadmap.md`](fork-roadmap.md) | Plan de fases completo (0–4) |
| [`alpha-plan.md`](alpha-plan.md) | Checklist Alpha 0/1 y criterios de aceptación |
| [`upstream-issue-tracker.md`](upstream-issue-tracker.md) | Issues y PRs del upstream, estado en el fork |
| [`docs-site-plan.md`](docs-site-plan.md) | Plan de landing/Vercel (diferido) |
| [`build-output.md`](build-output.md) | Pipeline de build y tree-shaking |
| [`research.md`](research.md) | Investigación inicial del ecosistema |
| [`release-checklist.md`](release-checklist.md) | Checklist canónico de release |
| [`npm-publishing.md`](npm-publishing.md) | Proceso y costos de npm |
| [`source-provenance.md`](source-provenance.md) | Registro de importación del source upstream |
