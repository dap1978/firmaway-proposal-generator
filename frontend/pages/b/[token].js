import fs from 'fs';
import path from 'path';

// Link publico y fijo para compartir la consola de billeteras completa
// (buscador, glosario y el panel por pais), sin pedir la clave del sitio.
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
  const html = fs.readFileSync(filePath, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.write(html);
  res.end();
  return { props: {} };
}

export default function SharedWallets() {
  return null;
}
