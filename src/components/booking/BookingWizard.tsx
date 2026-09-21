'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Scissors,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Phone,
  CalendarPlus,
  AlertCircle,
  Loader2,
  MapPin,
} from 'lucide-react';
import { formatCurrency, formatPhone } from '@/lib/utils';
import { addDays, format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Barber {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  services?: any[];
}

interface Service {
  id: string;
  name: string;
  description?: string | null;
  defaultPrice: number;
  defaultDurationMinutes: number;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  barbers: Barber[];
  services: Service[];
}

interface BookingWizardProps {
  tenant: Tenant;
}

export default function BookingWizard({ tenant }: BookingWizardProps) {
  const [step, setStep] = useState<number>(1); // 1: Barber, 2: Service, 3: DateTime, 4: Info, 5: Success
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedServicePrice, setSelectedServicePrice] = useState<number>(0);
  const [selectedServiceDuration, setSelectedServiceDuration] = useState<number>(30);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Slots Loading & State
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<{ time: string; dateTime: string }[]>([]);
  const [slotError, setSlotError] = useState<string | null>(null);

  // Submitting
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null);

  // Generate next 14 days
  const dateOptions = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));

  // When barber is selected, compute services with custom prices
  const getServicesForBarber = (barber: Barber) => {
    return tenant.services.map((service) => {
      const custom = barber.services?.find((bs: any) => bs.serviceId === service.id && bs.active);
      return {
        ...service,
        price: custom ? custom.price : service.defaultPrice,
        duration: custom ? custom.durationMinutes : service.defaultDurationMinutes,
      };
    });
  };

  // Fetch slots whenever Barber, Service, or Date changes on step 3
  useEffect(() => {
    if (step === 3 && selectedBarber && selectedService) {
      fetchSlots();
    }
  }, [step, selectedBarber, selectedService, selectedDate]);

  const fetchSlots = async () => {
    if (!selectedBarber || !selectedService) return;
    setLoadingSlots(true);
    setSlotError(null);
    setSelectedSlot(null);

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    try {
      const res = await fetch(
        `/api/public/slots?tenantId=${tenant.id}&barberId=${selectedBarber.id}&serviceId=${selectedService.id}&date=${dateStr}`
      );
      const data = await res.json();

      if (!res.ok) {
        setSlotError(data.error || 'Erro ao carregar horários.');
        setAvailableSlots([]);
      } else {
        setAvailableSlots(data.slots || []);
        if (data.price) setSelectedServicePrice(data.price);
        if (data.durationMinutes) setSelectedServiceDuration(data.durationMinutes);
      }
    } catch (err) {
      setSlotError('Falha ao conectar com o servidor.');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectBarber = (barber: Barber) => {
    setSelectedBarber(barber);
    setSelectedService(null);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleSelectService = (service: any) => {
    setSelectedService(service);
    setSelectedServicePrice(service.price);
    setSelectedServiceDuration(service.duration);
    setSelectedSlot(null);
    setStep(3);
  };

  const handleSelectSlot = (slotTime: string) => {
    setSelectedSlot(slotTime);
    setStep(4);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setSubmitError('Por favor, informe seu nome.');
      return;
    }
    if (!selectedBarber || !selectedService || !selectedSlot) {
      setSubmitError('Informações incompletas para o agendamento.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const [hours, minutes] = selectedSlot.split(':').map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hours, minutes, 0, 0);

    try {
      const res = await fetch('/api/public/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.id,
          barberId: selectedBarber.id,
          serviceId: selectedService.id,
          customerName: customerName.trim(),
          customerPhone: customerPhone ? customerPhone.replace(/\D/g, '') : null,
          dateTime: appointmentDate.toISOString(),
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Não foi possível confirmar o agendamento.');
        if (res.status === 409) {
          setStep(3);
          fetchSlots();
        }
      } else {
        setConfirmedAppointment(data.appointment);
        setStep(5);
      }
    } catch (err) {
      setSubmitError('Erro ao processar o agendamento. Verifique sua conexão.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setSelectedBarber(null);
    setSelectedService(null);
    setSelectedSlot(null);
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    setConfirmedAppointment(null);
    setSubmitError(null);
  };

  // Google Calendar URL Generator
  const getGoogleCalendarUrl = () => {
    if (!confirmedAppointment) return '#';
    const start = parseISO(confirmedAppointment.startTime);
    const end = parseISO(confirmedAppointment.endTime);

    const formatGCal = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const title = encodeURIComponent(`${confirmedAppointment.service.name} - ${tenant.name}`);
    const details = encodeURIComponent(
      `Agendamento com ${confirmedAppointment.barber.name} na ${tenant.name}.\nValor: ${formatCurrency(
        confirmedAppointment.priceCharged
      )}`
    );
    const location = encodeURIComponent(tenant.address || tenant.name);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGCal(
      start
    )}/${formatGCal(end)}&details=${details}&location=${location}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header com Progresso */}
      {step < 5 && (
        <div className="p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between mb-3">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-white transition"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
            ) : (
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Agendamento Rápido
              </span>
            )}
            <span className="text-xs font-medium text-slate-400">Passo {step} de 4</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-700 to-blue-500 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: Selecionar Barbeiro */}
      {step === 1 && (
        <div className="p-5 md:p-6 space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <User className="w-5 h-5 text-blue-400" /> Escolha o Profissional
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Selecione o barbeiro de sua preferência para ver os serviços e horários.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tenant.barbers.map((barber) => (
              <button
                key={barber.id}
                onClick={() => handleSelectBarber(barber)}
                className="flex flex-col items-center p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-blue-600/10 hover:border-blue-500/50 transition-all text-center group cursor-pointer"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-700 group-hover:border-blue-500 transition mb-3 relative bg-slate-800">
                  {barber.avatarUrl ? (
                    <img
                      src={barber.avatarUrl}
                      alt={barber.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-slate-500 absolute inset-0 m-auto" />
                  )}
                </div>
                <h3 className="font-bold text-white group-hover:text-blue-400 transition">
                  {barber.name}
                </h3>
                {barber.bio && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{barber.bio}</p>
                )}
                <span className="mt-3 text-xs font-semibold text-blue-400 bg-blue-600/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Selecionar
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Selecionar Serviço */}
      {step === 2 && selectedBarber && (
        <div className="p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-blue-500/50 bg-slate-800">
                {selectedBarber.avatarUrl ? (
                  <img
                    src={selectedBarber.avatarUrl}
                    alt={selectedBarber.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-slate-500 m-auto" />
                )}
              </div>
              <div>
                <p className="text-xs text-slate-400">Profissional</p>
                <h3 className="font-bold text-sm text-white">{selectedBarber.name}</h3>
              </div>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-blue-400 hover:underline"
            >
              Trocar
            </button>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Scissors className="w-5 h-5 text-blue-400" /> Escolha o Serviço
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Valores e tempo de atendimento específicos de {selectedBarber.name}.
            </p>
          </div>

          <div className="space-y-2.5">
            {getServicesForBarber(selectedBarber).map((service: any) => (
              <button
                key={service.id}
                onClick={() => handleSelectService(service)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-blue-600/10 hover:border-blue-500/50 transition-all text-left group"
              >
                <div className="flex-1 pr-3">
                  <h4 className="font-bold text-white group-hover:text-blue-400 transition">
                    {service.name}
                  </h4>
                  {service.description && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      {service.duration} min
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-blue-400">
                    {formatCurrency(service.price)}
                  </span>
                  <div className="text-xs text-slate-400 flex items-center justify-end mt-1 group-hover:text-blue-400">
                    Escolher <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Selecionar Data & Horário */}
      {step === 3 && selectedBarber && selectedService && (
        <div className="p-5 md:p-6 space-y-4">
          {/* Resumo do Selecionado */}
          <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400">Profissional:</span>{' '}
              <span className="font-semibold text-white">{selectedBarber.name}</span>
            </div>
            <div>
              <span className="text-slate-400">Serviço:</span>{' '}
              <span className="font-semibold text-blue-400">{selectedService.name}</span>
            </div>
          </div>

          {/* Carrossel de Datas */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Selecione o Dia
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {dateOptions.map((date, idx) => {
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-16 py-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-lg shadow-blue-600/20'
                        : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-semibold">
                      {isToday ? 'Hoje' : format(date, 'EEE', { locale: ptBR })}
                    </span>
                    <span className="text-lg font-extrabold">{format(date, 'd')}</span>
                    <span className="text-[10px] opacity-75">
                      {format(date, 'MMM', { locale: ptBR })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grade de Horários */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Horários Livres para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </label>

            {loadingSlots ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                <p className="text-xs">Buscando disponibilidade do barbeiro...</p>
              </div>
            ) : slotError ? (
              <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{slotError}</span>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="p-6 bg-slate-950/40 border border-slate-800 rounded-xl text-center">
                <p className="text-sm font-semibold text-slate-300">Nenhum horário disponível</p>
                <p className="text-xs text-slate-400 mt-1">
                  O profissional não possui horários livres nesta data ou está de folga. Por favor,
                  escolha outro dia.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => handleSelectSlot(slot.time)}
                    className="py-2.5 px-3 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-blue-600 hover:text-white hover:border-blue-500 font-bold text-sm text-slate-200 transition text-center focus:ring-2 focus:ring-blue-500"
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: Informações do Cliente & Confirmação */}
      {step === 4 && selectedBarber && selectedService && selectedSlot && (
        <form onSubmit={handleConfirmBooking} className="p-5 md:p-6 space-y-4">
          <div className="text-center mb-2">
            <h2 className="text-xl font-bold text-white">Quase lá! Finalize seu agendamento</h2>
            <p className="text-xs text-slate-400 mt-0.5">Preencha seus dados para garantir seu horário.</p>
          </div>

          {/* Card Resumo */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between items-center text-slate-300 border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Serviço:</span>
              <span className="font-bold text-white">{selectedService.name}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Profissional:</span>
              <span className="font-semibold text-white">{selectedBarber.name}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Data & Horário:</span>
              <span className="font-bold text-blue-400">
                {format(selectedDate, "dd/MM/yyyy")} às {selectedSlot} ({selectedServiceDuration} min)
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300 pt-1">
              <span className="text-slate-400">Valor Total:</span>
              <span className="text-lg font-extrabold text-blue-400">
                {formatCurrency(selectedServicePrice)}
              </span>
            </div>
          </div>

          {submitError && (
            <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Inputs */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Seu Nome Completo <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: João da Silva"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp / Telefone <span className="text-slate-500 text-[10px]">(Opcional)</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Ex: (11) 98765-4321"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none transition"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observações <span className="text-slate-500 text-[10px]">(Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Prefiro tesoura no topo..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-4 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white font-black text-base rounded-xl transition shadow-lg shadow-blue-700/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Confirmando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" /> Confirmar Agendamento
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 5: Sucesso / Confirmação Instantânea */}
      {step === 5 && confirmedAppointment && (
        <div className="p-6 md:p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto text-green-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Agendamento Confirmado!</h2>
            <p className="text-sm text-slate-400 mt-1">
              Seu horário está garantido na <strong className="text-white">{tenant.name}</strong>.
            </p>
          </div>

          {/* Comprovante */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-left space-y-3 text-sm">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Cliente:</span>
              <span className="font-bold text-white">{confirmedAppointment.customerName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Barbeiro:</span>
              <span className="font-bold text-white">{confirmedAppointment.barber.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Serviço:</span>
              <span className="font-semibold text-blue-400">
                {confirmedAppointment.service.name}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Data e Horário:</span>
              <span className="font-bold text-white">
                {format(parseISO(confirmedAppointment.startTime), "dd/MM/yyyy 'às' HH:mm")}
              </span>
            </div>
            {tenant.address && (
              <div className="flex justify-between items-start pt-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" /> Endereço:
                </span>
                <span className="text-right text-xs text-slate-300 max-w-[200px]">
                  {tenant.address}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={resetWizard}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-md shadow-blue-700/20"
            >
              Fazer Outro Agendamento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
