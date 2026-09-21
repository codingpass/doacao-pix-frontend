'use client';

import React, { useEffect, useState } from 'react';
import {
  Scissors,
  Plus,
  Edit2,
  Trash2,
  Clock,
  DollarSign,
  Users,
  Save,
  Loader2,
  X,
  Check,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Barber {
  id: string;
  name: string;
}

interface BarberService {
  id?: string;
  barberId: string;
  price: number;
  durationMinutes: number;
  active: boolean;
  barber?: Barber;
}

interface Service {
  id: string;
  name: string;
  description?: string | null;
  defaultPrice: number;
  defaultDurationMinutes: number;
  active: boolean;
  barberServices?: BarberService[];
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Service form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('45');
  const [defaultDurationMinutes, setDefaultDurationMinutes] = useState('30');
  const [barberPrices, setBarberPrices] = useState<{ [barberId: string]: { price: string; duration: string; active: boolean } }>({});

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resServices, resBarbers] = await Promise.all([
        fetch('/api/admin/services'),
        fetch('/api/admin/barbers'),
      ]);

      const dataServices = await resServices.json();
      const dataBarbers = await resBarbers.json();

      if (resServices.ok) setServices(dataServices);
      if (resBarbers.ok) setBarbers(dataBarbers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setDefaultPrice('45');
    setDefaultDurationMinutes('30');

    // Initialize custom prices per barber
    const bp: any = {};
    barbers.forEach((b) => {
      bp[b.id] = { price: '45', duration: '30', active: true };
    });
    setBarberPrices(bp);
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description || '');
    setDefaultPrice(service.defaultPrice.toString());
    setDefaultDurationMinutes(service.defaultDurationMinutes.toString());

    // Map existing barber custom prices
    const bp: any = {};
    barbers.forEach((b) => {
      const found = service.barberServices?.find((bs) => bs.barberId === b.id);
      if (found) {
        bp[b.id] = {
          price: found.price.toString(),
          duration: found.durationMinutes.toString(),
          active: found.active,
        };
      } else {
        bp[b.id] = {
          price: service.defaultPrice.toString(),
          duration: service.defaultDurationMinutes.toString(),
          active: true,
        };
      }
    });
    setBarberPrices(bp);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = editingService ? 'PUT' : 'POST';
      const formattedBarberPrices = Object.entries(barberPrices).map(([barberId, data]) => ({
        barberId,
        price: parseFloat(data.price || defaultPrice),
        durationMinutes: parseInt(data.duration || defaultDurationMinutes, 10),
        active: data.active,
      }));

      const body = {
        ...(editingService ? { id: editingService.id } : {}),
        name,
        description: description.trim() || null,
        defaultPrice: parseFloat(defaultPrice),
        defaultDurationMinutes: parseInt(defaultDurationMinutes, 10),
        barberPrices: formattedBarberPrices,
      };

      const res = await fetch('/api/admin/services', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este serviço?')) return;
    try {
      const res = await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Scissors className="w-6 h-6 text-amber-500" /> Serviços & Preços
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastre os serviços da barbearia e personalize preços e tempos de atendimento por barbeiro.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" /> Novo Serviço
        </button>
      </div>

      {/* Lista de Serviços */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : services.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <Scissors className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">Nenhum serviço cadastrado</h3>
          <p className="text-xs text-slate-400 mt-1">
            Clique no botão acima para adicionar o primeiro serviço da sua barbearia.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-base">{service.name}</h3>
                    {service.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-400">
                      {formatCurrency(service.defaultPrice)}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      ~{service.defaultDurationMinutes} min
                    </span>
                  </div>
                </div>

                {/* Preços por barbeiro */}
                {service.barberServices && service.barberServices.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Preços por Barbeiro:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {service.barberServices.map((bs) => (
                        <div
                          key={bs.id}
                          className="bg-slate-950/60 p-2 rounded-lg border border-slate-850 flex items-center justify-between"
                        >
                          <span className="font-medium text-slate-300 truncate max-w-[100px]">
                            {bs.barber?.name}
                          </span>
                          <span className="font-bold text-amber-400">
                            {formatCurrency(bs.price)}{' '}
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({bs.durationMinutes}m)
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => openEditModal(service)}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Editar / Ajustar Preços
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar/Editar Serviço & Preços Específicos */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingService ? 'Editar Serviço & Preços' : 'Novo Serviço'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nome do Serviço <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Corte Degrade Navalhado"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Corte com lavagem e finalização com pomada modeladora."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Preço Padrão (R$) <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Duração Padrão (minutos) <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={defaultDurationMinutes}
                    onChange={(e) => setDefaultDurationMinutes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Seção de Preços Específicos por Barbeiro */}
              {barbers.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-500" /> Preço e Tempo por Barbeiro
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Personalize individualmente se necessário
                    </span>
                  </div>

                  <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                    {barbers.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-900 last:border-0"
                      >
                        <span className="font-semibold text-slate-300 truncate max-w-[130px]">
                          {b.name}
                        </span>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">R$</span>
                            <input
                              type="number"
                              step="0.50"
                              placeholder={defaultPrice}
                              value={barberPrices[b.id]?.price || ''}
                              onChange={(e) =>
                                setBarberPrices({
                                  ...barberPrices,
                                  [b.id]: {
                                    ...barberPrices[b.id],
                                    price: e.target.value,
                                  },
                                })
                              }
                              className="w-20 bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 outline-none focus:border-amber-500 text-right"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="5"
                              placeholder={defaultDurationMinutes}
                              value={barberPrices[b.id]?.duration || ''}
                              onChange={(e) =>
                                setBarberPrices({
                                  ...barberPrices,
                                  [b.id]: {
                                    ...barberPrices[b.id],
                                    duration: e.target.value,
                                  },
                                })
                              }
                              className="w-16 bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 outline-none focus:border-amber-500 text-center"
                            />
                            <span className="text-slate-500 text-[10px]">min</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  {editingService ? 'Salvar Alterações' : 'Cadastrar Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
