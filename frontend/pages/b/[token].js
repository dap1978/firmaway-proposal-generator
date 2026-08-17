import fs from 'fs';
import path from 'path';

// Link publico y fijo para compartir solo la parte de billeteras de la consola
// interna (buscador + glosario), sin el panel de tratamiento fiscal por pais.
// El token vive en la variable de entorno WALLETS_SHARE_TOKEN, nunca en el repo.
export async function getServerSideProps({ params, res }) {
  const expected = process.env.WALLETS_SHARE_TOKEN;
  if (!expected || params.token !== expected) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<!doctype html><html><head><meta name="robots" content="noindex, nofollow"></head><body style="font-family:system-ui,sans-serif;padding:60px;color:#31353D;background:#FFFBF5">Página no encontrada.</body></html>');
    return { props: {} };
  }
  const filePath = path.join(process.cwd(), 'internal-content', 'politicas-billeteras.html');
  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace('<body>', '<body><script>window.__SCOPED__=true;</script>');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.write(html);
  res.end();
  return { props: {} };
}

export default function SharedWallets() {
  return null;
}
