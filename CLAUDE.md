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
- **Entreno en curso:** variable `draft = {name, date, exercises:[{name, sets:[{w,r,done}]}]}`.
- **Catálogo de ejercicios:** `CATALOG` (array de `{n:nombre, m:músculo}`) + `MUSCLES`
  (orden de grupos). `allExercises()` combina catálogo + `DB.customExercises`.
  `findMuscle(nombre)` devuelve el grupo muscular. `norm(s)` normaliza texto (minúsculas
  sin acentos) para las búsquedas.
- **Modelo de sesión guardada:** `{id, name, date, exercises:[{name, sets:[{w, r}]}]}`.
- **Cuerpo:** `{id, date, weight, measures:{Brazo, Cintura, ...}}`.
- **1RM estimado:** fórmula de Epley → `epley(w,r) = w * (1 + r/30)`.
- Helpers útiles ya existentes: `uid()`, `todayISO()`, `parseISO()`, `fmtLong()`,
  `fmtShort()`, `esc()` (escapar HTML — usarlo siempre con texto del usuario),
  `el(id)`, `toast(msg)`, y el modal (`openModal`, `closeModal`, `modalInput`,
  `confirmModal`).
- **Gráficas:** `drawChart(container, data, unit)` dibuja un line chart en SVG inline,
  con colores por tokens CSS (se adapta al tema).

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

## Cómo correr y probar

- **Servir por HTTP** (el service worker no anda abriendo el archivo directo):
  ```bash
  python3 -m http.server 8080
  ```
  y abrir http://localhost:8080
- Probar en pantalla angosta (DevTools → modo móvil) y en tema claro y oscuro.

## Deploy (GitHub Pages)

- `git add . && git commit -m "..." && git push` a la rama `main`. Pages redeploya solo.
- **El service worker es network-first para archivos propios**, con caché como respaldo
  offline. Si cambiás assets (CSS/JS/íconos), **subí el número de `CACHE` en `sw.js`**
  (`fierros-v2` → `fierros-v3`, etc.) para forzar la actualización.

## Roadmap / ideas (a implementar cuando se pida)

- Temporizador de descanso entre series (al marcar una serie hecha).
- RPE (esfuerzo percibido 1-10) y notas por serie/ejercicio.
- Usar el catálogo de ejercicios también al armar rutinas (hoy el editor de rutinas usa
  texto libre).
- Estadísticas de progreso por grupo muscular (ya se puede con `findMuscle`).
- Sincronización entre dispositivos (hoy los datos viven por dispositivo; se mueven con
  el respaldo JSON del botón ⬇).
- Superseries; a futuro empaquetar como app nativa para Google Play (Capacitor / TWA).

## Reglas para el asistente

- Preservá la simpleza: vanilla JS, sin dependencias nuevas salvo pedido explícito.
- No rompas el formato de datos guardado en `localStorage` sin migración (la gente ya
  tiene datos cargados). Si cambia el modelo, migrar dentro de `load()`.
- Después de cada cambio, recordá subir el `CACHE` de `sw.js` si tocaste assets.
