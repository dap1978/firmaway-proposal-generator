/**
 * POST /api/unlock
 * Recibe { key } en el body, compara contra ACCESS_KEY (variable de entorno
 * del servidor — nunca llega al browser). Si es correcta, setea una cookie
 * httpOnly que el middleware valida en cada request posterior.
 */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key } = req.body;
  const ACCESS_KEY = process.env.ACCESS_KEY;

  if (!ACCESS_KEY) {
    // En producción debería estar siempre configurada
    console.error('[unlock] ACCESS_KEY no está configurada en las variables de entorno');
    return res.status(500).json({ error: 'Configuración incompleta. Contactá al administrador.' });
  }

  if (!key || key.trim() !== ACCESS_KEY) {
    // Pequeño delay para dificultar fuerza bruta
    return setTimeout(() => {
      res.status(401).json({ error: 'Clave incorrecta.' });
    }, 400);
  }

  // Clave correcta → cookie httpOnly válida 30 días
  const maxAge = 30 * 24 * 60 * 60; // 30 días en segundos
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieFlags = [
    `fw_auth=1`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Strict`,
    `Max-Age=${maxAge}`,
    isProduction ? 'Secure' : '', // Secure solo en producción (HTTPS)
  ].filter(Boolean).join('; ');

  res.setHeader('Set-Cookie', cookieFlags);
  return res.status(200).json({ ok: true });
}
