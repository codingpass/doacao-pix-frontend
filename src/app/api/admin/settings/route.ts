import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
  });

  return NextResponse.json(tenant);
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json();
  const { name, primaryColor, secondaryColor, logoUrl, bannerUrl, bio, address, phone, customDomain } = body;

  const updated = await prisma.tenant.update({
    where: { id: session.tenantId },
    data: {
      name,
      primaryColor,
      secondaryColor,
      logoUrl,
      bannerUrl,
      bio,
      address,
      phone,
      customDomain: customDomain ? customDomain.trim().toLowerCase() : null,
    },
  });

  return NextResponse.json(updated);
}
