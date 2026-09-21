import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addMinutes, isBefore, isAfter } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, barberId, serviceId, customerName, customerPhone, dateTime, notes } = body;

    if (!tenantId || !barberId || !serviceId || !customerName || !dateTime) {
      return NextResponse.json(
        { error: 'Por favor, preencha todos os campos obrigatórios (nome, barbeiro, serviço e horário).' },
        { status: 400 }
      );
    }

    const startTime = new Date(dateTime);
    if (isNaN(startTime.getTime())) {
      return NextResponse.json({ error: 'Data e horário inválidos.' }, { status: 400 });
    }

    // Não permitir agendamentos no passado
    if (isBefore(startTime, new Date())) {
      return NextResponse.json(
        { error: 'Este horário já passou. Por favor, selecione um horário futuro.' },
        { status: 400 }
      );
    }

    // Obter preço e duração do serviço para o barbeiro
    const barberService = await prisma.barberService.findUnique({
      where: {
        barberId_serviceId: {
          barberId,
          serviceId,
        },
      },
      include: {
        service: true,
      },
    });

    let durationMinutes = 30;
    let priceCharged = 40.0;

    if (barberService && barberService.active) {
      durationMinutes = barberService.durationMinutes;
      priceCharged = barberService.price;
    } else {
      const defaultService = await prisma.service.findUnique({
        where: { id: serviceId },
      });
      if (!defaultService) {
        return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 404 });
      }
      durationMinutes = defaultService.defaultDurationMinutes;
      priceCharged = defaultService.defaultPrice;
    }

    const endTime = addMinutes(startTime, durationMinutes);

    // Transação atômica para impedir concorrência/duplicação de horário
    const appointment = await prisma.$transaction(async (tx) => {
      // 1. Verificar se já existe agendamento que colida com este horário
      const conflictingAppointment = await tx.appointment.findFirst({
        where: {
          tenantId,
          barberId,
          status: { not: 'CANCELLED' },
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } },
          ],
        },
      });

      if (conflictingAppointment) {
        throw new Error('CONCURRENCY_ERROR');
      }

      // 2. Criar agendamento
      return tx.appointment.create({
        data: {
          tenantId,
          barberId,
          serviceId,
          customerName: customerName.trim(),
          customerPhone: customerPhone ? customerPhone.trim() : null,
          startTime,
          endTime,
          priceCharged,
          status: 'CONFIRMED',
          notes: notes ? notes.trim() : null,
        },
        include: {
          barber: true,
          service: true,
          tenant: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Agendamento confirmado com sucesso!',
      appointment,
    });
  } catch (error: any) {
    if (error.message === 'CONCURRENCY_ERROR') {
      return NextResponse.json(
        {
          error:
            'Desculpe! Este horário acabou de ser preenchido por outro cliente. Por favor, escolha outro horário.',
        },
        { status: 409 }
      );
    }
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json({ error: 'Erro interno ao processar o agendamento.' }, { status: 500 });
  }
}
