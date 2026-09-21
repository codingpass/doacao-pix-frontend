import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed do Banco de Dados Multi-tenant...');

  // 1. Limpar dados anteriores
  await prisma.appointment.deleteMany();
  await prisma.barberSchedule.deleteMany();
  await prisma.barberService.deleteMany();
  await prisma.service.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // 2. Criar Barbearia Modelo
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Barbearia Vintage Lima',
      slug: 'vintage-lima',
      customDomain: 'barbearialima.com.br',
      primaryColor: '#C8102E', // Vermelho Barbearia Lima
      secondaryColor: '#0D1B2A', // Azul escuro / fundo logo
      bio: 'Tradição, estilo e cuidado masculino de alto padrão. Cortes clássicos, degradês perfeitos e toalha quente.',
      address: 'Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
      phone: '(11) 98765-4321',
      logoUrl: '/logo-barbearia-lima.png',
      bannerUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80',
    },
  });

  console.log(`💈 Tenant criado: ${tenant.name} (${tenant.slug})`);

  // 3. Criar Usuário Dono (Admin)
  const passwordHash = await bcrypt.hash('admin123', 10);
  const owner = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: 'Rodrigo Lima (Dono)',
      email: 'dono@vintagelima.com.br',
      passwordHash,
      role: 'OWNER',
    },
  });

  console.log(`👤 Usuário Admin: ${owner.email} | Senha: admin123`);

  // 4. Criar Barbeiros
  const barber1 = await prisma.barber.create({
    data: {
      tenantId: tenant.id,
      name: 'Cleverton Lemuel',
      avatarUrl: '/cleverton.jpg',
      bio: 'Master Barber com mais de 10 anos de experiência em tesoura clássica e visagismo.',
      phone: '(11) 99999-1111',
    },
  });

  const barber2 = await prisma.barber.create({
    data: {
      tenantId: tenant.id,
      name: 'Felipe Santiago',
      avatarUrl: '/felipe.jpg',
      bio: 'Especialista em Low Fade, Taper Fade, Platinados e alinhamento de barba com navalha.',
      phone: '(11) 99999-2222',
    },
  });

  console.log(`✂️ Barbeiros cadastrados: ${barber1.name} e ${barber2.name}`);

  // 5. Criar Serviços Base
  const sCorte = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      name: 'Corte de Cabelo',
      description: 'Corte tradicional ou degradê moderno, finalizado com lavagem e pomada premium.',
      defaultPrice: 45.0,
      defaultDurationMinutes: 30,
    },
  });

  const sBarba = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      name: 'Barba e Toalha Quente',
      description: 'Ritual completo com toalha quente, óleo pré-barba, navalhete descartável e pós-barba refrescante.',
      defaultPrice: 35.0,
      defaultDurationMinutes: 30,
    },
  });

  const sCombo = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      name: 'Combo Completo (Corte + Barba)',
      description: 'Experiência completa de corte e alinhamento de barba com toalha quente.',
      defaultPrice: 75.0,
      defaultDurationMinutes: 50,
    },
  });

  const sKids = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      name: 'Corte Infantil (Kids)',
      description: 'Atendimento especial e paciente para os pequenos.',
      defaultPrice: 40.0,
      defaultDurationMinutes: 30,
    },
  });

  // 6. Preços e Duração Customizados por Barbeiro (BarberService)
  // Marcos (Master Barber cobra mais no corte e combo)
  await prisma.barberService.createMany({
    data: [
      { barberId: barber1.id, serviceId: sCorte.id, price: 60.0, durationMinutes: 40 },
      { barberId: barber1.id, serviceId: sBarba.id, price: 40.0, durationMinutes: 30 },
      { barberId: barber1.id, serviceId: sCombo.id, price: 90.0, durationMinutes: 60 },
      { barberId: barber1.id, serviceId: sKids.id, price: 45.0, durationMinutes: 30 },
    ],
  });

  // Gabriel (Preços mais acessíveis e foco em agilidade)
  await prisma.barberService.createMany({
    data: [
      { barberId: barber2.id, serviceId: sCorte.id, price: 45.0, durationMinutes: 30 },
      { barberId: barber2.id, serviceId: sBarba.id, price: 35.0, durationMinutes: 25 },
      { barberId: barber2.id, serviceId: sCombo.id, price: 75.0, durationMinutes: 50 },
    ],
  });

  // 7. Horários de Expediente (Segunda a Sábado: 09:00 às 19:00, almoço 12:00 às 13:00)
  for (const barber of [barber1, barber2]) {
    for (let day = 1; day <= 6; day++) { // 1 = Seg ... 6 = Sab
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
  }

  // 8. Criar agendamento de exemplo para hoje
  const today = new Date();
  today.setHours(10, 0, 0, 0);
  const endToday = new Date(today);
  endToday.setMinutes(endToday.getMinutes() + 40);

  await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      barberId: barber1.id,
      serviceId: sCorte.id,
      customerName: 'Lucas Ferreira',
      customerPhone: '11988887777',
      startTime: today,
      endTime: endToday,
      priceCharged: 60.0,
      status: 'CONFIRMED',
      notes: 'Prefere corte com tesoura nas laterais.',
    },
  });

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
