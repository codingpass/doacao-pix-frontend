import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const services = await prisma.service.findMany({
    where: { tenantId: session.tenantId },
    include: {
      barberServices: {
        include: { barber: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(services);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json();
  const { name, description, defaultPrice, defaultDurationMinutes, barberPrices } = body;

  if (!name || defaultPrice === undefined) {
    return NextResponse.json({ error: 'Nome e preço padrão são obrigatórios' }, { status: 400 });
  }

  const service = await prisma.service.create({
    data: {
      tenantId: session.tenantId,
      name,
      description,
      defaultPrice: parseFloat(defaultPrice),
      defaultDurationMinutes: parseInt(defaultDurationMinutes || '30', 10),
    },
  });

  // Se foram enviados preços específicos por barbeiro
  if (Array.isArray(barberPrices)) {
    for (const bp of barberPrices) {
      if (bp.barberId && bp.price !== undefined) {
        await prisma.barberService.create({
          data: {
            barberId: bp.barberId,
            serviceId: service.id,
            price: parseFloat(bp.price),
            durationMinutes: parseInt(bp.durationMinutes || `${service.defaultDurationMinutes}`, 10),
            active: bp.active !== undefined ? bp.active : true,
          },
        });
      }
    }
  }

  return NextResponse.json(service);
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json();
  const { id, name, description, defaultPrice, defaultDurationMinutes, active, barberPrices } = body;

  if (!id) return NextResponse.json({ error: 'ID do serviço é obrigatório' }, { status: 400 });

  const service = await prisma.service.findFirst({
    where: { id, tenantId: session.tenantId },
  });

  if (!service) return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });

  const updated = await prisma.service.update({
    where: { id },
    data: {
      name,
      description,
      defaultPrice: defaultPrice !== undefined ? parseFloat(defaultPrice) : service.defaultPrice,
      defaultDurationMinutes:
        defaultDurationMinutes !== undefined
          ? parseInt(defaultDurationMinutes, 10)
          : service.defaultDurationMinutes,
      active: active !== undefined ? active : service.active,
    },
  });

  // Atualizar / Upsert preços por barbeiro
  if (Array.isArray(barberPrices)) {
    for (const bp of barberPrices) {
      if (bp.barberId) {
        await prisma.barberService.upsert({
          where: {
            barberId_serviceId: {
              barberId: bp.barberId,
              serviceId: id,
            },
          },
          create: {
            barberId: bp.barberId,
            serviceId: id,
            price: parseFloat(bp.price ?? updated.defaultPrice),
            durationMinutes: parseInt(bp.durationMinutes ?? updated.defaultDurationMinutes, 10),
            active: bp.active !== undefined ? bp.active : true,
          },
          update: {
            price: parseFloat(bp.price ?? updated.defaultPrice),
            durationMinutes: parseInt(bp.durationMinutes ?? updated.defaultDurationMinutes, 10),
            active: bp.active !== undefined ? bp.active : true,
          },
        });
      }
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID do serviço obrigatório' }, { status: 400 });

  await prisma.service.deleteMany({
    where: { id, tenantId: session.tenantId },
  });

  return NextResponse.json({ success: true });
}
