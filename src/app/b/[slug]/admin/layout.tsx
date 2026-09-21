'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Users,
  Scissors,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Loader2,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // If on the login page, don't protect layout
    if (pathname.endsWith('/admin/login')) {
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push(`/b/${slug}/admin/login`);
          return;
        }
        const data = await res.json();
        setUser(data.user);
        setTenant(data.tenant);
      } catch {
        router.push(`/b/${slug}/admin/login`);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [pathname, slug, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(`/b/${slug}/admin/login`);
    router.refresh();
  };

  if (pathname.endsWith('/admin/login')) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-xs">Carregando painel administrativo...</p>
      </div>
    );
  }

  const navItems = [
    {
      name: 'Agenda do Dia',
      href: `/b/${slug}/admin`,
      icon: Calendar,
      exact: true,
    },
    {
      name: 'Barbeiros & Horários',
      href: `/b/${slug}/admin/barbers`,
      icon: Users,
    },
    {
      name: 'Serviços & Preços',
      href: `/b/${slug}/admin/services`,
      icon: Scissors,
    },
    {
      name: 'Identidade & Dados',
      href: `/b/${slug}/admin/settings`,
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500">
            <Scissors className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-white truncate max-w-[180px]">
            {tenant?.name || 'Painel Admin'}
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-full md:h-screen w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Tenant Name */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <Scissors className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h2 className="font-extrabold text-sm text-white truncate">{tenant?.name}</h2>
              <span className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider">
                Painel Admin
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <Link
            href={`/b/${slug}`}
            target="_blank"
            className="flex items-center justify-between text-xs text-slate-400 hover:text-amber-400 p-2 rounded-lg bg-slate-950/60 border border-slate-800 transition"
          >
            <span className="flex items-center gap-1.5 truncate">
              <ExternalLink className="w-3.5 h-3.5" /> Ver Site Público
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="overflow-hidden pr-2">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
