'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Check,
  X,
  Loader2,
  AlertCircle,
  Save,
} from 'lucide-react';

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

interface Schedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
  active: boolean;
}

interface Barber {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  active: boolean;
  schedules?: Schedule[];
}

export default function AdminBarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Editing states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Schedule Drawer/Tab State
  const [selectedBarberForSchedule, setSelectedBarberForSchedule] = useState<Barber | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/barbers');
      const data = await res.json();
      if (res.ok) {
        setBarbers(data);
        if (data.length > 0 && !selectedBarberForSchedule) {
          loadBarberSchedule(data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadBarberSchedule = async (barber: Barber) => {
    setSelectedBarberForSchedule(barber);
    setScheduleSuccess(false);
    try {
      const res = await fetch(`/api/admin/schedules?barberId=${barber.id}`);
      const data = await res.json();
      if (res.ok) {
        // Complete missing days
        const fullSchedules: Schedule[] = [];
        for (let day = 0; day <= 6; day++) {
          const found = data.find((s: any) => s.dayOfWeek === day);
          if (found) {
            fullSchedules.push(found);
          } else {
            fullSchedules.push({
              dayOfWeek: day,
              startTime: '09:00',
              endTime: '19:00',
              breakStart: '12:00',
              breakEnd: '13:00',
              active: day !== 0, // Domingo inativo por padrão
            });
          }
        }
        setSchedules(fullSchedules);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openCreateModal = () => {
    setEditingBarber(null);
    setName('');
    setAvatarUrl('');
    setBio('');
    setPhone('');
    setIsModalOpen(true);
  };

  const openEditModal = (barber: Barber) => {
    setEditingBarber(barber);
    setName(barber.name);
    setAvatarUrl(barber.avatarUrl || '');
    setBio(barber.bio || '');
    setPhone(barber.phone || '');
    setIsModalOpen(true);
  };

  const handleSaveBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingBarber ? 'PUT' : 'POST';
      const body = {
        ...(editingBarber ? { id: editingBarber.id } : {}),
        name,
        avatarUrl: avatarUrl.trim() || null,
        bio: bio.trim() || null,
        phone: phone.trim() || null,
      };

      const res = await fetch('/api/admin/barbers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchBarbers();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBarber = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este profissional?')) return;
    try {
      const res = await fetch(`/api/admin/barbers?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchBarbers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSchedule = async () => {
    if (!selectedBarberForSchedule) return;
    setSavingSchedule(true);
    setScheduleSuccess(false);

    try {
      const res = await fetch('/api/admin/schedules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId: selectedBarberForSchedule.id,
          schedules,
        }),
      });

      if (res.ok) {
        setScheduleSuccess(true);
        setTimeout(() => setScheduleSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSchedule(false);
    }
  };

  const updateDaySchedule = (dayOfWeek: number, field: keyof Schedule, value: any) => {
    setSchedules((prev) =>
      prev.map((item) => (item.dayOfWeek === dayOfWeek ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" /> Barbeiros & Expedientes
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastre os profissionais da barbearia e configure a grade de horários de cada um.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" /> Novo Barbeiro
        </button>
      </div>

      {/* Grid de Barbeiros */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {barbers.map((barber) => {
            const isSelected = selectedBarberForSchedule?.id === barber.id;

            return (
              <div
                key={barber.id}
                onClick={() => loadBarberSchedule(barber)}
                className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition cursor-pointer ${
                  isSelected
                    ? 'border-amber-500/80 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-amber-500/40 bg-slate-800">
                        {barber.avatarUrl ? (
                          <img
                            src={barber.avatarUrl}
                            alt={barber.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-6 h-6 text-slate-500 m-auto mt-3" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{barber.name}</h3>
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                            barber.active
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {barber.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {barber.bio && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{barber.bio}</p>
                  )}
                  {barber.phone && (
                    <p className="text-xs text-slate-500 mb-2">Tel: {barber.phone}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] text-amber-400 font-medium">
                    {isSelected ? '● Editando Horários' : 'Clique para ver horários'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(barber);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBarber(barber.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor de Expediente Semanal */}
      {selectedBarberForSchedule && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" /> Grade de Horários:{' '}
                <span className="text-amber-400">{selectedBarberForSchedule.name}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Defina o expediente e o intervalo de almoço para cada dia da semana.
              </p>
            </div>

            <button
              onClick={handleSaveSchedule}
              disabled={savingSchedule}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-amber-600/20 disabled:opacity-50"
            >
              {savingSchedule ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Salvar Horários
                </>
              )}
            </button>
          </div>

          {scheduleSuccess && (
            <div className="p-3 bg-green-950/40 border border-green-800/50 rounded-xl text-green-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" /> Grade de horários salva com sucesso!
            </div>
          )}

          <div className="space-y-3">
            {schedules.map((s) => (
              <div
                key={s.dayOfWeek}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                  s.active
                    ? 'bg-slate-950/50 border-slate-800'
                    : 'bg-slate-950/20 border-slate-850 opacity-50'
                }`}
              >
                {/* Day Switcher */}
                <div className="flex items-center gap-3 w-44">
                  <input
                    type="checkbox"
                    id={`day-${s.dayOfWeek}`}
                    checked={s.active}
                    onChange={(e) =>
                      updateDaySchedule(s.dayOfWeek, 'active', e.target.checked)
                    }
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <label
                    htmlFor={`day-${s.dayOfWeek}`}
                    className="font-bold text-sm text-white cursor-pointer"
                  >
                    {DAYS_OF_WEEK[s.dayOfWeek]}
                  </label>
                </div>

                {/* Time Inputs */}
                {s.active ? (
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    {/* Expediente */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Expediente:</span>
                      <input
                        type="time"
                        value={s.startTime}
                        onChange={(e) =>
                          updateDaySchedule(s.dayOfWeek, 'startTime', e.target.value)
                        }
                        className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 outline-none focus:border-amber-500"
                      />
                      <span className="text-slate-500">até</span>
                      <input
                        type="time"
                        value={s.endTime}
                        onChange={(e) =>
                          updateDaySchedule(s.dayOfWeek, 'endTime', e.target.value)
                        }
                        className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Almoço/Pausa */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Intervalo/Almoço:</span>
                      <input
                        type="time"
                        value={s.breakStart || ''}
                        onChange={(e) =>
                          updateDaySchedule(s.dayOfWeek, 'breakStart', e.target.value)
                        }
                        className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 outline-none focus:border-amber-500"
                      />
                      <span className="text-slate-500">até</span>
                      <input
                        type="time"
                        value={s.breakEnd || ''}
                        onChange={(e) =>
                          updateDaySchedule(s.dayOfWeek, 'breakEnd', e.target.value)
                        }
                        className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 italic">Folga / Não atende</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Criar/Editar Barbeiro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingBarber ? 'Editar Profissional' : 'Novo Barbeiro'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBarber} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nome do Barbeiro <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Oliveira"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">URL da Foto</label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/foto.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Telefone</label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Especialidade / Bio</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Especialista em tesoura, fade e barba desenhada."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingBarber ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
