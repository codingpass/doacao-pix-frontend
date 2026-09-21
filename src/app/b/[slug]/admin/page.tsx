'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  XCircle,
  Phone,
  Filter,
  DollarSign,
  Loader2,
  RefreshCw,
  MessageCircle,
} from 'lucide-react';
import { formatCurrency, formatPhone } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  customerName: string;
  customerPhone?: string | null;
  startTime: string;
  endTime: string;
  priceCharged: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string | null;
  barber: { id: string; name: string };
  service: { id: string; name: string };
}

interface Barber {
  id: string;
  name: string;
}

export default function AdminAgendaPage() {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedBarberId, setSelectedBarberId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBarbers();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, selectedBarberId, selectedStatus]);

  const fetchBarbers = async () => {
    try {
      const res = await fetch('/api/admin/barbers');
      const data = await res.json();
      if (res.ok) setBarbers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/appointments?date=${selectedDate}`;
      if (selectedBarberId) url += `&barberId=${selectedBarberId}`;
      if (selectedStatus) url += `&status=${selectedStatus}`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setAppointments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: status as any } : app))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics
  const activeAppointments = appointments.filter((a) => a.status !== 'CANCELLED');
  const totalRevenue = activeAppointments.reduce((acc, a) => acc + a.priceCharged, 0);
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-amber-500" /> Agenda do Dia
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize e gerencie todos os agendamentos da sua barbearia em tempo real.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-amber-500 cursor-pointer"
          />
          <button
            onClick={fetchAppointments}
            title="Atualizar Agenda"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Total de Agendamentos</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl font-black text-white">{activeAppointments.length}</h3>
            <span className="text-xs text-slate-500">
              {appointments.length - activeAppointments.length} cancelados
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Faturamento Previsto</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl font-black text-amber-400">{formatCurrency(totalRevenue)}</h3>
            <DollarSign className="w-5 h-5 text-amber-500/40" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Atendimentos Concluídos</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl font-black text-green-400">
              {completedCount} / {activeAppointments.length}
            </h3>
            <CheckCircle2 className="w-5 h-5 text-green-500/40" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-amber-500" /> Filtrar:
        </span>

        {/* Barber Filter */}
        <select
          value={selectedBarberId}
          onChange={(e) => setSelectedBarberId(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-amber-500"
        >
          <option value="">Todos os Barbeiros</option>
          {barbers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-amber-500"
        >
          <option value="">Todos os Status</option>
          <option value="CONFIRMED">Confirmados</option>
          <option value="COMPLETED">Concluídos</option>
          <option value="CANCELLED">Cancelados</option>
        </select>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs">Carregando agendamentos...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-2">
          <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Nenhum agendamento encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Não há agendamentos para a data e filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((app) => {
            const start = parseISO(app.startTime);
            const isConfirmed = app.status === 'CONFIRMED';
            const isCompleted = app.status === 'COMPLETED';
            const isCancelled = app.status === 'CANCELLED';

            return (
              <div
                key={app.id}
                className={`bg-slate-900 border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                  isCancelled
                    ? 'border-red-900/30 opacity-60 bg-slate-950/40'
                    : isCompleted
                    ? 'border-green-900/40 bg-slate-900/90'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Time + Info */}
                <div className="flex items-start gap-4">
                  {/* Time Badge */}
                  <div
                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border font-mono font-bold flex-shrink-0 ${
                      isCancelled
                        ? 'bg-red-950/30 border-red-900 text-red-400'
                        : isCompleted
                        ? 'bg-green-950/30 border-green-800 text-green-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    <span className="text-sm">{format(start, 'HH:mm')}</span>
                    <span className="text-[10px] opacity-75">
                      {format(parseISO(app.endTime), 'HH:mm')}
                    </span>
                  </div>

                  {/* Customer & Service Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-base">{app.customerName}</h4>
                      {/* Status Badge */}
                      {isConfirmed && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                          Confirmado
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded">
                          Concluído
                        </span>
                      )}
                      {isCancelled && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded">
                          Cancelado
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Scissors className="w-3.5 h-3.5 text-amber-500" />
                        <strong className="text-slate-200">{app.service.name}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{app.barber.name}</span>
                      </span>
                      <span>•</span>
                      <span className="font-bold text-amber-400">
                        {formatCurrency(app.priceCharged)}
                      </span>
                    </div>

                    {app.customerPhone && (
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />{' '}
                          {formatPhone(app.customerPhone)}
                        </span>
                        <a
                          href={`https://wa.me/55${app.customerPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-green-400 hover:text-green-300 flex items-center gap-1 bg-green-950/30 px-2 py-0.5 rounded border border-green-800/40"
                        >
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </a>
                      </div>
                    )}

                    {app.notes && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-950/50 px-2 py-1 rounded mt-1">
                        "{app.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                  {updatingId === app.id ? (
                    <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                  ) : (
                    <>
                      {isConfirmed && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white border border-green-600/40 rounded-lg text-xs font-semibold transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Concluir
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 rounded-lg text-xs font-semibold transition"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancelar
                          </button>
                        </>
                      )}
                      {(isCompleted || isCancelled) && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                          className="text-xs text-slate-400 hover:text-white underline"
                        >
                          Reabrir
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
