import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Ignorar arquivos estáticos, rotas internas do Next e APIs diretas
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Se já está acessando explicitamente a rota /b/... deixa passar
  if (url.pathname.startsWith('/b/')) {
    return NextResponse.next();
  }

  // Identificar se é um domínio próprio ou subdomínio
  // Ex: barbearialima.com.br -> reescreve internamente para /b/barbearialima.com.br
  // Ex: lima.seusaas.com -> reescreve internamente para /b/lima
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

  if (!isLocalhost) {
    // Se for subdomínio (ex: lima.meusaas.com.br)
    const parts = hostname.split('.');
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'app') {
      const subdomain = parts[0];
      return NextResponse.rewrite(new URL(`/b/${subdomain}${url.pathname}`, request.url));
    }

    // Se for domínio customizado inteiro (ex: barbearialima.com.br)
    return NextResponse.rewrite(new URL(`/b/${hostname}${url.pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)'],
};
