import { getTenantByDomainOrSlug } from '@/lib/tenant';
import { notFound } from 'next/navigation';
import BookingWizard from '@/components/booking/BookingWizard';
import {
  Scissors,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  User,
  LogIn,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default async function TenantPublicPage({ params }: { params: { slug: string } }) {
  const tenant = await getTenantByDomainOrSlug(params.slug);

  if (!tenant) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#111318] text-slate-100 flex flex-col">
      {/* Top Bar / Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0D1B2A]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-700/20 border border-red-600/40 flex items-center justify-center text-red-500 font-black">
                <Scissors className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="font-extrabold text-base md:text-lg tracking-tight text-white">
                {tenant.name}
              </h1>
              {tenant.address && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-500" /> {tenant.address.split('-')[0]}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/b/${tenant.slug}/admin/login`}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 py-1.5 px-3 rounded-lg border border-slate-800 hover:border-slate-700 transition"
            >
              <LogIn className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden sm:inline">Painel Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-8 md:py-14 px-4 bg-gradient-to-b from-[#0D1B2A] to-[#111318] border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          {/* Logo grande no hero */}
          {tenant.logoUrl && (
            <div className="flex justify-center">
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="w-32 h-32 object-contain drop-shadow-[0_0_20px_rgba(200,16,46,0.4)]"
              />
            </div>
          )}

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-700/10 border border-red-600/30 text-red-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Agendamento Online Rápido &amp; Sem Cadastro
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Reserve seu horário em <span className="text-red-500">poucos segundos</span>
          </h2>
          {tenant.bio && (
            <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto">
              {tenant.bio}
            </p>
          )}

          {tenant.phone && (
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-red-500" /> {tenant.phone}
              </span>
              {tenant.address && (
                <span className="hidden sm:flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" /> {tenant.address}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full space-y-12">
        {/* WIZARD DE AGENDAMENTO */}
        <section id="agendamento" className="scroll-mt-20">
          <BookingWizard tenant={tenant as any} />
        </section>

        {/* TABELA DE PREÇOS E SERVIÇOS */}
        <section className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
              <Scissors className="w-6 h-6 text-red-500" /> Tabela de Serviços &amp; Preços
            </h3>
            <p className="text-xs md:text-sm text-slate-400">
              Conheça nossos serviços padrão. Os valores podem variar de acordo com o profissional selecionado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenant.services.map((service) => (
              <div
                key={service.id}
                className="bg-[#0D1B2A]/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-red-700/40 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-white text-base">{service.name}</h4>
                    <span className="text-base font-extrabold text-blue-400 whitespace-nowrap">
                      a partir de {formatCurrency(service.defaultPrice)}
                    </span>
                  </div>
                  {service.description && (
                    <p className="text-xs text-slate-400 mt-1">{service.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  <span>Duração estimada: ~{service.defaultDurationMinutes} min</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EQUIPE DE PROFISSIONAIS */}
        <section className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
              <User className="w-6 h-6 text-red-500" /> Nossa Equipe
            </h3>
            <p className="text-xs md:text-sm text-slate-400">
              Profissionais qualificados prontos para entregar o melhor corte e acabamento.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tenant.barbers.map((barber) => (
              <div
                key={barber.id}
                className="bg-[#0D1B2A]/60 border border-slate-800 rounded-xl p-5 flex items-center gap-4"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-600/40 bg-slate-800 flex-shrink-0">
                  {barber.avatarUrl ? (
                    <img
                      src={barber.avatarUrl}
                      alt={barber.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-500 m-auto mt-3" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{barber.name}</h4>
                  {barber.bio && <p className="text-xs text-slate-400 mt-1">{barber.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#0D1B2A] py-8 px-4 text-center text-xs text-slate-500 mt-12 space-y-2">
        <p>© {new Date().getFullYear()} {tenant.name}. Todos os direitos reservados.</p>
        <p className="text-[11px] text-slate-600">
          Powered by <strong className="text-slate-400">BarberSaaS Multi-Tenant</strong>
        </p>
      </footer>
    </div>
  );
}
