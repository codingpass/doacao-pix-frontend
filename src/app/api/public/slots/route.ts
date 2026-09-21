import { NextRequest, NextResponse } from 'next/server';
import { getBarberAvailableSlots } from '@/lib/slots';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');
  const barberId = searchParams.get('barberId');
  const serviceId = searchParams.get('serviceId');
  const date = searchParams.get('date'); // YYYY-MM-DD

  if (!tenantId || !barberId || !serviceId || !date) {
    return NextResponse.json(
      { error: 'Parâmetros obrigatórios ausentes: tenantId, barberId, serviceId, date' },
      { status: 400 }
    );
  }

  try {
    const result = await getBarberAvailableSlots(tenantId, barberId, serviceId, date);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao calcular horários disponíveis' }, { status: 500 });
  }
}
