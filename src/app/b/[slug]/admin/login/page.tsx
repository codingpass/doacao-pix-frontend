'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Lock, Mail, Scissors, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [email, setEmail] = useState('dono@vintagelima.com.br');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Credenciais inválidas.');
      } else {
        router.push(`/b/${slug}/admin`);
        router.refresh();
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/b/${slug}`}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao site
          </Link>
          <span className="text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            Painel do Dono
          </span>
        </div>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
            <Scissors className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white">Acesso Administrativo</h1>
          <p className="text-xs text-slate-400">
            Gerencie agendamentos, equipe, serviços e configurações da sua barbearia.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none transition"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Senha</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none transition"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl transition shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Entrando...
              </>
            ) : (
              'Entrar no Painel'
            )}
          </button>
        </form>

        <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl text-center">
          <p className="text-[11px] text-slate-400">
            Acesso demo: <strong className="text-amber-400">dono@vintagelima.com.br</strong> /{' '}
            <strong className="text-amber-400">admin123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
