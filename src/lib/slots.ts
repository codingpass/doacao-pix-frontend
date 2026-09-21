import { prisma } from './prisma';
import { parse, format, addMinutes, isBefore, isAfter, isEqual } from 'date-fns';

export interface AvailableSlot {
  time: string; // "09:00"
  dateTime: string; // ISO string
  available: boolean;
}

export async function getBarberAvailableSlots(
  tenantId: string,
  barberId: string,
  serviceId: string,
  dateStr: string // "YYYY-MM-DD"
): Promise<{ durationMinutes: number; price: number; slots: AvailableSlot[] }> {
  // 1. Obter duração e preço do serviço para este barbeiro
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
  let price = 40.0;

  if (barberService && barberService.active) {
    durationMinutes = barberService.durationMinutes;
    price = barberService.price;
  } else {
    const defaultService = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!defaultService) {
      throw new Error('Serviço não encontrado');
    }
    durationMinutes = defaultService.defaultDurationMinutes;
    price = defaultService.defaultPrice;
  }

  // 2. Determinar o dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay();

  // 3. Buscar expediente do barbeiro neste dia da semana
  const schedule = await prisma.barberSchedule.findUnique({
    where: {
      barberId_dayOfWeek: {
        barberId,
        dayOfWeek,
      },
    },
  });

  if (!schedule || !schedule.active) {
    return { durationMinutes, price, slots: [] }; // Barbeiro de folga
  }

  // 4. Buscar agendamentos já marcados para o barbeiro nesta data
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      barberId,
      status: { not: 'CANCELLED' },
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  // 5. Montar os slots do expediente
  const [startH, startM] = schedule.startTime.split(':').map(Number);
  const [endH, endM] = schedule.endTime.split(':').map(Number);

  const workStart = new Date(year, month - 1, day, startH, startM, 0);
  const workEnd = new Date(year, month - 1, day, endH, endM, 0);

  let breakStart: Date | null = null;
  let breakEnd: Date | null = null;

  if (schedule.breakStart && schedule.breakEnd) {
    const [bStartH, bStartM] = schedule.breakStart.split(':').map(Number);
    const [bEndH, bEndM] = schedule.breakEnd.split(':').map(Number);
    breakStart = new Date(year, month - 1, day, bStartH, bStartM, 0);
    breakEnd = new Date(year, month - 1, day, bEndH, bEndM, 0);
  }

  const now = new Date();
  const slots: AvailableSlot[] = [];

  // Intervalo padrão de 30 minutos entre slots para visualização limpa
  const slotInterval = 30;
  let currentSlotStart = new Date(workStart);

  while (true) {
    const currentSlotEnd = addMinutes(currentSlotStart, durationMinutes);

    // Se o término do atendimento ultrapassar o fim do expediente, encerra
    if (isAfter(currentSlotEnd, workEnd)) {
      break;
    }

    let isAvailable = true;

    // Verificar se colide com o horário de almoço/pausa
    if (breakStart && breakEnd) {
      const overlapsBreak =
        (isAfter(currentSlotEnd, breakStart) && isBefore(currentSlotStart, breakEnd)) ||
        isEqual(currentSlotStart, breakStart);

      if (overlapsBreak) {
        isAvailable = false;
      }
    }

    // Verificar se colide com agendamentos existentes
    if (isAvailable) {
      for (const app of existingAppointments) {
        const appStart = new Date(app.startTime);
        const appEnd = new Date(app.endTime);

        // Há sobreposição se: currentSlotStart < appEnd && currentSlotEnd > appStart
        if (isBefore(currentSlotStart, appEnd) && isAfter(currentSlotEnd, appStart)) {
          isAvailable = false;
          break;
        }
      }
    }

    // Se a data for hoje, bloquear horários que já passaram
    if (isAvailable && isBefore(currentSlotStart, now)) {
      isAvailable = false;
    }

    const timeStr = format(currentSlotStart, 'HH:mm');

    if (isAvailable) {
      slots.push({
        time: timeStr,
        dateTime: currentSlotStart.toISOString(),
        available: true,
      });
    }

    currentSlotStart = addMinutes(currentSlotStart, slotInterval);
  }

  return { durationMinutes, price, slots };
}
