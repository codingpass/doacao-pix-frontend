import { NextRequest, NextResponse } from 'next/server';
import { getTenantByDomainOrSlug } from '@/lib/tenant';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('slug') || searchParams.get('domain');

  if (!identifier) {
    return NextResponse.json({ error: 'Identificador do tenant obrigatório' }, { status: 400 });
  }

  const tenant = await getTenantByDomainOrSlug(identifier);
  if (!tenant) {
    return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
  }

  return NextResponse.json(tenant);
}
