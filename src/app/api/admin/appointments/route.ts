import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date'); // YYYY-MM-DD
  const barberId = searchParams.get('barberId');
  const status = searchParams.get('status');

  let dateFilter = {};
  if (dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59);
    dateFilter = {
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId: session.tenantId,
      ...(barberId ? { barberId } : {}),
      ...(status ? { status } : {}),
      ...dateFilter,
    },
    include: {
      barber: true,
      service: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  return NextResponse.json(appointments);
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: 'ID e status são obrigatórios' }, { status: 400 });
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id, tenantId: session.tenantId },
  });

  if (!appointment) {
    return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status },
    include: {
      barber: true,
      service: true,
    },
  });

  return NextResponse.json(updated);
}
