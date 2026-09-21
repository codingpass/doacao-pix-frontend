import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const barbers = await prisma.barber.findMany({
    where: { tenantId: session.tenantId },
    include: {
      schedules: true,
      services: {
        include: { service: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(barbers);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json();
  const { name, avatarUrl, bio, phone } = body;

  if (!name) {
    return NextResponse.json({ error: 'Nome do barbeiro é obrigatório' }, { status: 400 });
  }

  const barber = await prisma.barber.create({
    data: {
      tenantId: session.tenantId,
      name,
      avatarUrl,
      bio,
      phone,
    },
  });

  // Criar expedientes padrão para segunda a sábado
  for (let day = 1; day <= 6; day++) {
    await prisma.barberSchedule.create({
      data: {
        barberId: barber.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '19:00',
        breakStart: '12:00',
        breakEnd: '13:00',
        active: true,
      },
    });
  }

  return NextResponse.json(barber);
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json();
  const { id, name, avatarUrl, bio, phone, active } = body;

  if (!id) return NextResponse.json({ error: 'ID do barbeiro obrigatório' }, { status: 400 });

  const barber = await prisma.barber.findFirst({
    where: { id, tenantId: session.tenantId },
  });

  if (!barber) return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 });

  const updated = await prisma.barber.update({
    where: { id },
    data: {
      name,
      avatarUrl,
      bio,
      phone,
      active: active !== undefined ? active : barber.active,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID do barbeiro obrigatório' }, { status: 400 });

  await prisma.barber.deleteMany({
    where: { id, tenantId: session.tenantId },
  });

  return NextResponse.json({ success: true });
}
