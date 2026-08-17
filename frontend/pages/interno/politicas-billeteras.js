import fs from 'fs';
import path from 'path';

// Sirve firmaway-consola-interna-mercados.html tal cual (bytes sin tocar).
// No se envuelve en el layout de React para no duplicar <html>/<head>/<body>.
export async function getServerSideProps({ res }) {
  const filePath = path.join(process.cwd(), 'internal-content', 'politicas-billeteras.html');
  const html = fs.readFileSync(filePath, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.write(html);
  res.end();
  return { props: {} };
}

export default function PoliticasBilleteras() {
  return null;
}
