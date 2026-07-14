# CLAUDE.md

Guía para Claude Code al trabajar en este repo.

## Proyecto

Herramienta interna (equipo comercial de Firmaway) para generar propuestas comerciales, correr la presentación de ventas en vivo y consultar el playbook de discovery. No es un producto para clientes finales — salvo la vista pública `/p/[token]` donde el lead ve su propuesta.

## Stack y comandos

| Capa | Tecnología | Comando dev |
|---|---|---|
| Frontend | Next.js (Pages Router) | `cd frontend && npm run dev` (puerto 3000) |
| Backend | Express + PostgreSQL + Anthropic SDK + Puppeteer | `cd backend && npm run dev` (nodemon) |

`.claude/launch.json` ya usa `npm --prefix frontend run dev` — si el preview integrado falla con "Missing script: dev", revisar que `frontend/node_modules` esté instalado (`cd frontend && npm install`).

## Git workflow

Push directo a `master`, sin PRs. Dos remotes:
- `origin` → `dap1978/firmaway-proposal-generator` (principal)
- `mirror` → `danielpalacios488-ai/firmaway-proposal-generator`

Vercel deploya el frontend automáticamente al pushear a `master`.

**Auth:** todas las rutas salvo `/p/`, `/lock`, `/api/unlock` están detrás de un wall (`fw_auth` cookie, ver `frontend/middleware.js`). Clave de acceso en la variable `ACCESS_KEY` de Vercel. En dev local (`NODE_ENV !== 'production'`) el middleware no aplica.

## Estructura

```
backend/src/
  index.js                    # entry point, monta rutas /api/*
  config/database.js          # pool de PostgreSQL
  routes/
    proposals.js              # POST /generate (LLC y whitelabel), /p/:token, /:id/preview, stats
    users.js                  # lista fija de comerciales (USERS)
  services/
    claude.js                 # prompt + llamada a Claude para propuestas LLC (analiza transcripción)
    template.js                # renderTemplate() (LLC) y renderTemplateWhitelabel() (whitelabel)
    pdf.js                     # genera PDF con Puppeteer a partir del HTML
  templates/
    proposal.html              # template LLC, placeholders {{...}}, i18n es/pt vía objeto i18n en template.js
    proposal_whitelabel.html   # template whitelabel, placeholders WL_*, i18n vía WL_I18N es/pt

frontend/pages/
  index.js                    # hub — grid 2x2 con 4 herramientas (LLC, Whitelabel, Presentación, Guía)
  select-user.js               # selector de comercial, filtrado por tool (?tool=llc|whitelabel)
  generate.js                  # formulario de generación, lee ?tool= de la URL
  pitch.js                     # presentación de ventas en vivo (8 slides, ES/PT, contenido en CONTENT{})
  guide.js                     # playbook de discovery por perfil de cliente (contenido estático)
  history.js                   # historial de propuestas generadas + stats por comercial
  preview/[id].js               # vista interna de una propuesta (editor + envío)
  p/[token].js                  # vista PÚBLICA de la propuesta para el lead (única ruta sin auth además de /lock)
  lock.js / api/unlock.js       # pantalla y endpoint de acceso
```

## Flujos principales

**Propuesta LLC:** el comercial pega la transcripción de la llamada → `claude.js` la analiza con un prompt con reglas de negocio fijas (precios, plazos, paquetes) → `renderTemplate()` llena `proposal.html` → se guarda en `proposals` y se previsualiza/edita en `/preview/[id]` antes de enviar el link público (`/p/[token]`).

**Propuesta Whitelabel:** sin transcripción ni Claude — mismo template para todos los socios (`proposal_whitelabel.html`), solo se personaliza nombre del socio, logo y precio en `/preview/[id]`.

**Presentación (`/pitch`):** deck de 8 slides para compartir pantalla en la llamada de ventas (distinto de la propuesta personalizada, que se manda después). Todo el copy vive en `CONTENT = { es: {...}, pt: {...} }` dentro de `pitch.js`, con toggle de idioma en vivo.

**Guía para tu reunión (`/guide`):** playbook de discovery por perfil de cliente (Amazon FBA, SaaS, consultoría, holding, e-commerce, cripto) — contenido estático en español, uso interno, no se comparte con leads.

**Hub (`/`):** 4 cards en grid 2x2 (LLC, Whitelabel, Presentación, Guía). LLC y Whitelabel pasan primero por `/select-user` (selector de comercial, con lista restringida distinta por tool); Presentación y Guía van directo.

## i18n (ES/PT)

Tres sistemas de contenido bilingüe independientes, no comparten estructura:
- **LLC:** `i18n.es` / `i18n.pt` en `template.js`, placeholders `{{...}}` en `proposal.html`.
- **Whitelabel:** `WL_I18N.es` / `WL_I18N.pt` + `WL_DEFAULTS.es` / `WL_DEFAULTS.pt` en `template.js`, placeholders `WL_*` en `proposal_whitelabel.html`.
- **Pitch:** `CONTENT.es` / `CONTENT.pt` en `pitch.js`, consumido directo por los componentes React (sin placeholders).

**Gotcha de `renderTemplateWhitelabel()`:** el reemplazo de placeholders es de una sola pasada por clave (`Object.entries(vars)`). Si un valor de traducción trae un placeholder anidado (ej. `{{CLIENT_NAME}}` dentro de `WL_DEMO_INTRO`), hay que resolverlo en JS *antes* de armar el objeto `vars`, porque si `CLIENT_NAME` ya se "gastó" antes en el barrido, el anidado nunca se reemplaza. Ver el patrón `demoIntroFilled` / `ctaTitleFilled` en `template.js`.

## Design system (Firmaway)

```js
const C = {
  bg: '#FFFFFF', warm: '#FFFBF5', cardBg: '#FEF1E0',
  ink: '#31353D', muted: 'rgba(49,53,61,0.45)',
  orange: '#F15A2F', orangeSoft: '#FDEEE9',
  border: 'rgba(49,53,61,0.12)', dark: '#2E3135',
};
```
- Offset shadow `4px 4px 0px 0px` es el rasgo identitario — usarlo en cards.
- Hover de cards del hub: siempre sombra/borde **naranja** (no el color de acento propio de cada card).
- Nunca usar `#FFFFFF` puro como fondo de card (el skill `formato-firma` lo marca como error).
- Sin emojis decorativos en ningún lado de la UI — solo símbolos funcionales (✓, ✕, ★).

## Datos de negocio vigentes (pitch deck, slide de Estados/Paquetes)

Precios en USD (ES) y su conversión a BRL (PT) — la cotización se fija a mano en el código, no es dinámica. Si el tipo de cambio se mueve mucho, actualizar a mano en `pitch.js` (`CONTENT.pt.packages.items[].price`, `CONTENT.pt.states.items[].fee`, `CONTENT.pt.states.oblig`). Última actualización: cotización ~R$5,11 por USD (jul 2026).

| Ítem | USD | R$ |
|---|---|---|
| Solo LLC | 495 | 2.530 |
| Essencial (PT) / Starter (ES) | 499 | 2.550 |
| Pro | 645 | 3.300 |
| All In | 1.199 | 6.130 |
| Obligaciones anuales (base) | 699 | 3.570 |

El paquete PT se llama **"Essencial"** (no "Starter" — ES sí usa "Starter").

## Verificación de cambios de frontend

El preview integrado de Claude Code en esta sesión está limitado al proyecto primario (otro repo) y no puede apuntar acá. Para verificar cambios visuales: `cd frontend && npm run build` (chequeo de compilación) y, si hace falta ver el render, levantar `npx next dev -p <puerto-libre>` manualmente y usar el navegador — recordar matar el proceso al terminar.
