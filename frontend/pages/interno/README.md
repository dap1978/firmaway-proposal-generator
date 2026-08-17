# /interno

Herramientas de uso interno. Hoy: `politicas-billeteras`, una guía de
referencia sobre FATCA, CRS, CARF y regímenes locales de billeteras por
país. El botón vive en la home junto al resto de las herramientas
comerciales.

## Compuerta de acceso

Se usa la compuerta 1 del encargo (middleware de Next.js), que ya existía en
este proyecto antes de agregar `/interno`: `frontend/middleware.js` protege
todas las rutas con una cookie `fw_auth` seteada al validar `ACCESS_KEY`
(variable de entorno de Vercel, nunca en el repo) contra `/lock`.

No se agregó middleware nuevo. `/interno/politicas-billeteras` cae bajo el
matcher existente (`'/((?!_next/static|_next/image|favicon.ico).*)'`) igual
que el resto del sitio, así que queda protegida sin tocar ese archivo.

Rutas explícitamente afuera de esta compuerta (no tocar): `/p/*` (propuestas
públicas que abren los prospectos por link directo), `/lock`, `/api/unlock`.

Esta compuerta es real (cookie firmada del lado del servidor, no un chequeo
de cliente), a diferencia de la opción 2 del encargo que hubiera sido solo un
obstáculo cosmético. No hace falta la advertencia de esa opción acá.

## Contenido

`internal-content/politicas-billeteras.html` arrancó como el archivo
original del encargo, sin tocar. Después Daniel pidió reescribir el
enfoque: menos "guion de venta" (se sacaron las frases prohibidas, la
frase lista para copiar y los criterios de descalificación) y más guía de
referencia (glosario de FATCA, CRS y CARF con fecha de vigencia de cada
uno, más la matriz de adhesión por país). El buscador de plataformas se
mantuvo igual. `pages/interno/politicas-billeteras.js` lee el HTML del
disco en `getServerSideProps` y lo devuelve tal cual, sin envolverlo en el
layout de React, para no duplicar `<html>/<head>/<body>`.

## Al agregar una herramienta nueva

Sumar la card al array `TOOLS` de `pages/index.js`, con la ruta bajo
`/interno/...`. Esa ruta queda protegida automáticamente por el mismo
middleware, sin pasos extra.
