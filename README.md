# Comunicación Digital ESG

Sitio-presentación del módulo de comunicación digital del Diplomado en Sostenibilidad y Comunicación Corporativa: 3 clases, encuestas en vivo, fuentes y trabajo final.

## Estructura

- `public/index.html`: todo el contenido (láminas, casos, fuentes). Las láminas están como datos en el `<script>`, en `CLASSES`.
- `public/img/`: fotos del sitio. Se usan con `foto("img/archivo.jpg", "texto alternativo", "pie de foto")`.
- `netlify/functions/votes.mjs`: API de votación en `/api/votes`, guarda en Netlify Blobs.

## Publicar en Netlify

1. En Netlify: **Add new site → Import an existing project →** elegir este repositorio. No hace falta configurar nada más; `netlify.toml` ya indica la carpeta y las funciones.
2. En **Site configuration → Environment variables**, crear `PROFE_KEY` con una clave que solo tú conozcas.
3. Volver a desplegar (Deploys → Trigger deploy) para que tome la variable.
4. Cambiar el nombre del sitio en **Site configuration → Change site name** (por ejemplo `diplomado-esg.netlify.app`).

## Modo profesor

Abre una vez en tu navegador `https://TU-SITIO.netlify.app/?profe=TU_CLAVE`. La clave queda guardada en ese navegador y se borra de la barra de direcciones. Desde ahí ves siempre los resultados y tienes el botón **Reiniciar encuesta** (útil para probar antes de clase o reutilizar con otra cohorte).

## Cómo funcionan los votos

- Anónimos, un voto por dispositivo y encuesta (se puede cambiar de opción).
- Los resultados se actualizan cada 4 segundos, solo para las encuestas visibles en pantalla.
- Cada alumno ve los resultados después de votar.

## Agregar contenido incrustado

Dentro del `b:` de una lámina:

- `ytEmbed("ID_DEL_VIDEO", "Título")` para YouTube
- `igEmbed("CODIGO")` para Instagram (el código que aparece en instagram.com/p/CODIGO)
- `ttEmbed("ID")` para TikTok (el número al final del link del video)
