# Fierros — contexto del proyecto

App web (PWA) para llevar el control de entrenamientos y progresos en el gimnasio.
Mobile-first, se instala en el celular y funciona offline. Los datos se guardan en el
dispositivo (no hay backend). En producción: https://tanitocode.github.io/fierros/

## Stack y filosofía

- **HTML + CSS + JavaScript puro (vanilla). SIN frameworks, SIN build, SIN dependencias npm.**
- Mantener este enfoque: nada de React/Vue/bundlers salvo que se decida explícitamente.
- Única dependencia externa: Google Fonts (Oswald + Manrope). Todo lo demás es local.
- UI en español, tono argentino. Diseño mobile-first.

## Estructura

```
index.html            # marcado + <head> (manifest, íconos, fuentes)
styles.css            # estilos, con tokens de tema claro/oscuro
app.js                # TODA la lógica (un IIFE, "use strict")
manifest.webmanifest  # metadatos PWA
sw.js                 # service worker (offline)
icons/                # íconos de la app
```

## Arquitectura de app.js

- Todo vive dentro de un IIFE `(function(){ ... })()`.
- **Estado / datos:** objeto `DB = {routines, sessions, body, customExercises}`.
  - Persistencia en `localStorage`, clave `"fierros.v1"`. Además `"fierros.v1.draft"`
    (entreno en curso) y `"fierros.v1.theme"`.
  - `load()` / `save()` manejan la lectura/escritura. `save()` serializa `DB` entero.
- **Vistas (4 tabs):** `hoy`, `rutinas`, `progreso`, `cuerpo`. Cada una tiene su
  `renderHoy()`, `renderRutinas()`, `renderProgreso()`, `renderCuerpo()`. La navegación
  la maneja `go(tab)` y el router mínimo `render()`.
- Render por strings de HTML + `innerHTML`, y luego se cablean los eventos con
  `querySelectorAll(...).onclick`. No hay virtual DOM.
- **Entreno en curso:** variable `draft = {name, date, exercises:[{name, t, sets:[...]}]}`.
  Cada ejercicio del draft lleva `t` (tipo). Forma de cada serie según `t`:
  `wr` → `{w,r,done}` · `time` → `{sec,done}` · `cardio` → `{sec,dist,done}` (`sec` en
  segundos, `dist` en km).
- **Tipos de ejercicio (`t`):** `"wr"` peso+reps (default, se omite) · `"time"` isométricos
  y sostenidos por tiempo (plancha, wall sit, dead hang…) · `"cardio"` máquinas de cardio
  (cinta, bici, elíptica, escaladora, remo…), campos min+km.
- **Catálogo de ejercicios:** `CATALOG` (array de `{n:nombre, m:músculo, t:tipo}`) + `MUSCLES`
  (orden de grupos; incluye `"Cardio"`). `allExercises()` combina catálogo + `DB.customExercises`.
  `findMuscle(nombre)` devuelve el grupo muscular; `findType(nombre)` el tipo (`wr` por
  defecto). `newSet(t, proto)` crea una serie vacía de la forma correcta. `norm(s)` normaliza
  texto (minúsculas sin acentos) para las búsquedas.
- **Modelo de sesión guardada:** `{id, name, date, exercises:[{name, t?, sets:[...]}]}`.
  `wr` (sin `t`): `sets:[{w,r}]` · `time`: `t:"time"`, `sets:[{sec}]` · `cardio`:
  `t:"cardio"`, `sets:[{sec,dist}]`. Leer siempre como `e.t || "wr"` (retrocompatible).
- **Cronómetro de ejercicio (tipo `time`):** reusa la barra flotante del descanso.
  `restTimer.kind` distingue `"rest"` de `"work"`; en `work`, `mode:"down"` (cuenta regresiva
  desde el objetivo en `sec`, pita al llegar a 0) o `"up"` (cuenta hacia arriba, se guarda al
  tocar "Guardar"). Al terminar escribe los segundos en la serie y arranca el descanso.
  Funciones: `startWorkTimer(ei,si)`, `finishWorkTimer(keep)`, `syncRestControls()` (relabela
  los 3 botones de la barra según kind/mode). La barra viene de `index.html` (`#restLabel`,
  `#restMinus/#restPlus/#restSkip`, `#restTime`, `#restCard`).
- **Render por tipo (`t`):** `renderActive()` (entreno en curso), `openSession()` (detalle
  guardado), `renderProgreso()` y la línea del historial de `renderHoy()` ramifican según
  `e.t || "wr"`. Progreso `time` = mejor tiempo / mejor sesión / acumulado; `cardio` =
  distancia máx / mejor ritmo (min/km) / sesión más larga / km totales. Sin 1RM ni
  volumen kg para `time`/`cardio`. `progExType(nombre)` resuelve el tipo mirando las
  sesiones guardadas (fallback a `findType`).
- **Rutinas por tipo:** cada ejercicio de rutina puede llevar `t` + objetivo: `wr` usa
  `{sets, reps}`, `time` usa `{sets, secs}`, `cardio` usa `{mins, dist}` (1 set). El editor
  infiere `t` con `findType(nombre)` al agregar. `startFromRoutine()` arma el `draft` con la
  forma de serie correcta.
- **Cuerpo:** `{id, date, weight, measures:{Brazo, Cintura, ...}}`.
- **1RM estimado:** fórmula de Epley → `epley(w,r) = w * (1 + r/30)`.
- Helpers útiles ya existentes: `uid()`, `todayISO()`, `parseISO()`, `fmtLong()`,
  `fmtShort()`, `esc()` (escapar HTML — usarlo siempre con texto del usuario),
  `el(id)`, `toast(msg)`, y el modal (`openModal`, `closeModal`, `modalInput`,
  `confirmModal`).
- **Helpers de tiempo / distancia:** `fmtDur(sec)` → `"m:ss"` · `parseDur(str)` acepta
  `"90"` o `"1:30"` y devuelve segundos · `secToMin(sec)` → minutos (inputs de cardio) ·
  `trimNum(n)` recorta a 2 decimales · `fmtPace(sec, km)` → `"m:ss/km"`.
- **Gráficas:** `drawChart(container, data, unit, fmtY?)` dibuja un line chart en SVG inline,
  con colores por tokens CSS (se adapta al tema). `fmtY` (opcional) formatea etiquetas del
  eje Y y la etiqueta final; se pasa `fmtDur` para gráficas de tiempo y de ritmo.

## Convenciones de estilo

- **Tema claro/oscuro por tokens CSS.** Los colores se definen como variables en `:root`
  (claro) y se redefinen para oscuro en los bloques `@media (prefers-color-scheme: dark)`
  y `:root[data-theme="dark"]` / `:root[data-theme="light"]`. **Si agregás un color,
  definilo en AMBOS temas.** Nunca hardcodear un color solo para un tema.
- Tipografía: **Oswald** para títulos, labels y números tipo "marcador"; **Manrope** para
  el resto de la UI. Números con `font-variant-numeric: tabular-nums` (clase `.tnum`).
- Acento visual = rojo (inspirado en el código de colores de discos olímpicos).
- Tap targets grandes (es mobile-first). Cuidar accesibilidad básica (`aria-label` en
  botones de solo ícono, foco visible).
- **Filas de series por tipo** (en `styles.css`): `.set-row.t-time` (grid con el botón
  cronómetro `.tmr-btn`), `.set-row.t-timero` / `.t-cardioro` (solo lectura, en el detalle
  de sesión). `.rest-bar.work` = barra en modo cronómetro (borde de acento). Cada variante
  define su `grid-template-columns` explícito; si agregás otra, seguí ese patrón.

## Cómo correr y probar

- **Servir por HTTP** (el service worker no anda abriendo el archivo directo):
  ```bash
  python3 -m http.server 8080
  ```
  y abrir http://localhost:8080
- Probar en pantalla angosta (DevTools → modo móvil) y en tema claro y oscuro.

## Deploy (GitHub Pages)

- Repo: `github.com/TanitoCode/fierros` (rama `main`).
- `git add . && git commit -m "..." && git push` a la rama `main`. Pages redeploya solo
  (~1-2 min) → https://tanitocode.github.io/fierros/
- **El service worker es network-first para archivos propios**, con caché como respaldo
  offline. Si cambiás assets (CSS/JS/íconos), **subí el número de `CACHE` en `sw.js`**
  (actual: `fierros-v4`; `v4` → `v5`, etc.) para forzar la actualización.

## Roadmap / ideas (a implementar cuando se pida)

- **Ejercicios sin peso — Etapa 3:** peso + tiempo (plancha con disco, caminata del granjero
  con mancuernas), calorías / nivel de resistencia / FC en cardio, ritmo objetivo, y
  buscador del catálogo dentro del editor de rutinas para elegir tipo `time`/`cardio`.
  (Etapa 1 y 2 ya hechas: tipos `time` y `cardio`, cronómetro cuenta arriba/abajo,
  grupo "Cardio", progreso por tipo.)
- RPE (esfuerzo percibido 1-10) y notas por serie/ejercicio.
- Usar el catálogo de ejercicios también al armar rutinas (hoy el editor de rutinas usa
  texto libre; ya infiere el tipo con `findType`).
- Estadísticas de progreso por grupo muscular (ya se puede con `findMuscle`).
- Sincronización entre dispositivos (hoy los datos viven por dispositivo; se mueven con
  el respaldo JSON del botón ⬇ — que ahora incluye `customExercises`).
- Superseries; a futuro empaquetar como app nativa para Google Play (Capacitor / TWA).

## Reglas para el asistente

- **Se trabaja desde varias máquinas** (esta y otras, sin coordinación entre sesiones).
  Al arrancar a trabajar en este repo, correr `git fetch` + `git status` antes de asumir
  que está al día — puede haber commits remotos sin traer, o cambios locales sin commitear
  de una sesión anterior en esta misma máquina. Si hay commits remotos nuevos, traerlos
  (`git pull --ff-only`; si hay cambios locales sin commitear, `git stash` antes y
  `git stash pop` después, resolviendo a mano cualquier conflicto). Repetir el mismo
  chequeo (`git fetch` + `git status`) después de cada tanda de cambios, justo antes de
  commitear y pushear, para no pisar trabajo hecho en otra máquina mientras tanto.
- Preservá la simpleza: vanilla JS, sin dependencias nuevas salvo pedido explícito.
- No rompas el formato de datos guardado en `localStorage` sin migración (la gente ya
  tiene datos cargados). Si cambia el modelo, migrar dentro de `load()`.
- Después de cada cambio, recordá subir el `CACHE` de `sw.js` si tocaste assets.
