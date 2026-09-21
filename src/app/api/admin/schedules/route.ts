import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const barberId = searchParams.get('barberId');

  if (!barberId) {
    return NextResponse.json({ error: 'ID do barbeiro obrigatório' }, { status: 400 });
  }

  const schedules = await prisma.barberSchedule.findMany({
    where: {
      barberId,
      barber: { tenantId: session.tenantId },
    },
    orderBy: { dayOfWeek: 'asc' },
  });

  return NextResponse.json(schedules);
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json();
  const { barberId, schedules } = body;

  if (!barberId || !Array.isArray(schedules)) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
  }

  // Verificar se o barbeiro pertence a este tenant
  const barber = await prisma.barber.findFirst({
    where: { id: barberId, tenantId: session.tenantId },
  });

  if (!barber) return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 });

  // Atualizar cada dia
  for (const s of schedules) {
    await prisma.barberSchedule.upsert({
      where: {
        barberId_dayOfWeek: {
          barberId,
          dayOfWeek: s.dayOfWeek,
        },
      },
      create: {
        barberId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime || '09:00',
        endTime: s.endTime || '19:00',
        breakStart: s.breakStart || '12:00',
        breakEnd: s.breakEnd || '13:00',
        active: s.active !== undefined ? s.active : true,
      },
      update: {
        startTime: s.startTime,
        endTime: s.endTime,
        breakStart: s.breakStart,
        breakEnd: s.breakEnd,
        active: s.active,
      },
    });
  }

  return NextResponse.json({ success: true, message: 'Horários atualizados com sucesso' });
}
