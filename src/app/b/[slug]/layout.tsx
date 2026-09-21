import { getTenantByDomainOrSlug } from '@/lib/tenant';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tenant = await getTenantByDomainOrSlug(params.slug);
  if (!tenant) return { title: 'Barbearia não encontrada' };

  return {
    title: `${tenant.name} - Agendamento Online`,
    description: tenant.bio || `Agende seu corte e barba na ${tenant.name}.`,
    openGraph: {
      title: `${tenant.name} | Agende seu Horário`,
      description: tenant.bio || `Agende seu corte e barba na ${tenant.name}.`,
      images: tenant.logoUrl ? [tenant.logoUrl] : [],
    },
  };
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const tenant = await getTenantByDomainOrSlug(params.slug);

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-extrabold text-amber-500 mb-4">404</h1>
          <h2 className="text-2xl font-bold mb-2">Barbearia Não Encontrada</h2>
          <p className="text-slate-400 mb-6">
            O endereço ou domínio acessado não está associado a nenhuma barbearia ativa em nosso sistema.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-amber-600 hover:bg-amber-500 text-black font-semibold rounded-xl transition"
          >
            Ir para Início
          </a>
        </div>
      </div>
    );
  }

  const primaryColor = tenant.primaryColor || '#D97706';
  const secondaryColor = tenant.secondaryColor || '#0F172A';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <style>{`
        :root {
          --brand-primary: ${primaryColor};
          --brand-secondary: ${secondaryColor};
          --brand-accent: ${primaryColor};
        }
      `}</style>
      {children}
    </div>
  );
}
