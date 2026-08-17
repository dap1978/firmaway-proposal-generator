import { NextResponse } from 'next/server';

// Rutas que NO requieren autenticación
const PUBLIC_PREFIXES = [
  '/p/',           // propuestas públicas para leads
  '/b/',           // link fijo compartido de la consola de billeteras (token en WALLETS_SHARE_TOKEN)
  '/lock',         // pantalla de acceso
  '/api/unlock',   // endpoint que valida la clave
  '/_next/',       // assets de Next.js
  '/favicon',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // En desarrollo local, no aplicar protección
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  // Rutas públicas: pasar directamente
  if (PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Verificar cookie de sesión
  const authCookie = request.cookies.get('fw_auth');
  if (authCookie?.value === '1') {
    return NextResponse.next();
  }

  // Sin cookie válida → redirigir a pantalla de acceso
  // Guardamos la ruta original para redirigir después del login
  const lockUrl = new URL('/lock', request.url);
  lockUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(lockUrl);
}

export const config = {
  // Aplica a todas las rutas excepto archivos estáticos
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
