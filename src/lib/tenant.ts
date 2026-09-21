import { prisma } from './prisma';

export async function getTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({
    where: { slug },
    include: {
      barbers: {
        where: { active: true },
        include: {
          services: {
            where: { active: true },
            include: {
              service: true,
            },
          },
          schedules: {
            where: { active: true },
          },
        },
      },
      services: {
        where: { active: true },
      },
    },
  });
}

export async function getTenantByDomainOrSlug(identifier: string) {
  // 1. Tentar por customDomain direto
  let tenant = await prisma.tenant.findUnique({
    where: { customDomain: identifier },
    include: {
      barbers: {
        where: { active: true },
        include: {
          services: {
            where: { active: true },
            include: {
              service: true,
            },
          },
          schedules: {
            where: { active: true },
          },
        },
      },
      services: {
        where: { active: true },
      },
    },
  });

  // 2. Se não encontrou, tentar por slug
  if (!tenant) {
    tenant = await prisma.tenant.findUnique({
      where: { slug: identifier },
      include: {
        barbers: {
          where: { active: true },
          include: {
            services: {
              where: { active: true },
              include: {
                service: true,
              },
            },
            schedules: {
              where: { active: true },
            },
          },
        },
        services: {
          where: { active: true },
        },
      },
    });
  }

  return tenant;
}
