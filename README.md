# 🏋️ Fierros

App web (PWA) para llevar el control de tus entrenamientos y progresos en el gimnasio.
Registra ejercicios (series, reps y peso), organiza rutinas por día, mide tu progreso
corporal y visualiza tu evolución con gráficas y récords personales (PRs).

Funciona en el celular o la compu, se instala en la pantalla de inicio como una app,
y anda **sin internet**. Los datos se guardan en tu dispositivo (no hay servidor).

## Características

- **Hoy** — inicia un entreno desde una rutina o libre; carga cada ejercicio con sus series (kg/reps), marca las hechas y guarda la sesión. Historial con volumen total.
- **Rutinas** — crea y edita tus días de entreno (Push/Pull/Legs, etc.) con series×reps objetivo.
- **Progreso** — gráficas de peso máximo y 1RM estimado (fórmula de Epley) por ejercicio, más tus PRs.
- **Cuerpo** — registra peso corporal y medidas (brazo, cintura, pecho…) y observa la evolución.
- **Respaldo** — exporta/importa tus datos en un archivo `.json` para tener copia o pasarlos a otro dispositivo.
- Tema claro/oscuro y diseño mobile-first.

## Stack

HTML + CSS + JavaScript, sin frameworks ni dependencias. `localStorage` para los datos,
manifest + service worker para la PWA. Todo estático: se puede hostear en cualquier lado.

## Correr localmente

Necesita servirse por HTTP (el service worker no funciona abriendo el archivo directo).
Con cualquiera de estos, desde la carpeta del proyecto:

```bash
python3 -m http.server 8080
# o
npx serve .
```

Luego abrí http://localhost:8080

## Publicar en GitHub Pages

1. Subí este proyecto a un repo (ver más abajo).
2. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, elegí la rama `main` y carpeta `/ (root)`.
3. A los ~1-2 minutos queda online en `https://<tu-usuario>.github.io/<repo>/`.

## Instalar en el celular

Abrí la URL en el navegador del teléfono:

- **Android (Chrome):** menú ⋮ → *Agregar a la pantalla principal* / *Instalar app*.
- **iPhone (Safari):** botón Compartir → *Agregar a inicio*.

Queda con su ícono y a pantalla completa, como cualquier app.

## Estructura

```
fierros/
├── index.html            # marcado + <head> (manifest, íconos, fuentes)
├── styles.css            # estilos (tema claro/oscuro por tokens)
├── app.js                # toda la lógica de la app
├── manifest.webmanifest  # metadatos de la PWA
├── sw.js                 # service worker (offline)
└── icons/                # íconos de la app
```

## Roadmap (ideas)

- [ ] Temporizador de descanso entre series
- [ ] RPE y notas por serie/ejercicio
- [ ] Superseries
- [ ] Sincronización entre dispositivos
- [ ] Empaquetar como app nativa para Google Play (Capacitor / TWA)

## Licencia

MIT
