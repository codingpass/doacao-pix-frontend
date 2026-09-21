'use client';

import React, { useState, useEffect } from 'react';
import {
  PawPrint,
  Heart,
  QrCode,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
} from 'lucide-react';

interface DonationData {
  id: string;
  amountCents: number;
  pixCopyPaste: string;
  qrCodeBase64: string;
}

type CheckoutStep = 'SELECT' | 'PAYMENT' | 'SUCCESS' | 'EXPIRED';

interface LiveDonation {
  name: string;
  amount: string;
  timeAgo: string;
  city: string;
}

const RECENT_DONATIONS: LiveDonation[] = [
  { name: 'Mariana S.', amount: 'R$ 50,00', timeAgo: 'há 2 minutos', city: 'São Paulo, SP' },
  { name: 'Carlos E.', amount: 'R$ 30,00', timeAgo: 'há 4 minutos', city: 'Curitiba, PR' },
  { name: 'Ana Paula G.', amount: 'R$ 100,00', timeAgo: 'há 7 minutos', city: 'Campinas, SP' },
  { name: 'Lucas M.', amount: 'R$ 15,00', timeAgo: 'há 11 minutos', city: 'Belo Horizonte, MG' },
  { name: 'Fernanda R.', amount: 'R$ 50,00', timeAgo: 'há 15 minutos', city: 'Porto Alegre, RS' },
];

export default function PixDonationCheckout() {
  const [step, setStep] = useState<CheckoutStep>('SELECT');
  const [presetAmount, setPresetAmount] = useState<number | null>(30);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [donationData, setDonationData] = useState<DonationData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(1800);
  const [liveIndex, setLiveIndex] = useState<number>(0);

  useEffect(() => {
    const liveInterval = setInterval(() => {
      setLiveIndex((prev) => {
        const next = prev + 1;
        if (next >= RECENT_DONATIONS.length) {
          return 0;
        } else {
          return next;
        }
      });
    }, 4500);

    return () => clearInterval(liveInterval);
  }, []);

  function getSelectedAmountCents(preset: number | null, customStr: string): number {
    if (preset !== null) {
      return preset * 100;
    } else {
      if (customStr.trim() === '') {
        return 0;
      }
      const cleanStr = customStr.replace(',', '.');
      const parsed = parseFloat(cleanStr);
      if (isNaN(parsed)) {
        return 0;
      }
      return Math.round(parsed * 100);
    }
  }

  function validateAmountCents(cents: number): string | null {
    if (cents < 1500) {
      return 'O valor mínimo para doação é R$ 15,00 (1.500 centavos).';
    } else if (cents > 100000) {
      return 'O valor máximo para doação é R$ 1.000,00 (100.000 centavos).';
    } else {
      return null;
    }
  }

  function formatCentsToBRL(cents: number): string {
    const realValue = cents / 100;
    return realValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatTimer(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    let minStr = String(minutes);
    let secStr = String(remainingSeconds);

    if (minutes < 10) {
      minStr = '0' + minStr;
    }
    if (remainingSeconds < 10) {
      secStr = '0' + secStr;
    }

    return minStr + ':' + secStr;
  }

  function getImpactDescription(cents: number): string {
    if (cents === 1500) {
      return 'Com R$ 15,00 você salva 1 vida no PetVida! (Garante ração e cuidados básicos)';
    } else if (cents === 3000) {
      return 'Com R$ 30,00 você salva 2 vidas no PetVida! (Garante ração e medicamentos essenciais)';
    } else if (cents === 5000) {
      return 'Com R$ 50,00 você salva 3 vidas no PetVida! (Garante ração, vacinas e tratamento completo)';
    } else if (cents === 100000) {
      return 'Com R$ 1.000,00 você salva o abrigo PetVida inteiro! (Alimenta e trata dezenas de animais)';
    } else if (cents >= 10000) {
      const lives = Math.floor(cents / 1500);
      return 'Com ' + formatCentsToBRL(cents) + ' você salva cerca de ' + lives + ' vidas com resgate, ração e medicamentos!';
    } else if (cents >= 1500) {
      const lives = Math.floor(cents / 1500);
      return 'Com ' + formatCentsToBRL(cents) + ' você garante alimentação e remédios para ' + lives + ' animal resgatado no PetVida!';
    } else {
      return 'Escolha um valor para ver o impacto direto na vida dos animais necessitados do PetVida.';
    }
  }

  function handlePresetClick(amount: number) {
    setPresetAmount(amount);
    setCustomAmount('');
    setError(null);
  }

  function handleCustomAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCustomAmount(e.target.value);
    setPresetAmount(null);
    setError(null);
  }

  async function handleGeneratePix() {
    setError(null);
    const cents = getSelectedAmountCents(presetAmount, customAmount);
    const validationError = validateAmountCents(cents);

    if (validationError !== null) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    try {
      const response = await fetch(baseUrl + '/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amountCents: cents }),
      });

      if (response.ok) {
        const data = await response.json();
        setDonationData({
          id: data.id,
          amountCents: data.amountCents,
          pixCopyPaste: data.pixCopyPaste,
          qrCodeBase64: data.qrCodeBase64,
        });
        setSecondsLeft(1800);
        setStep('PAYMENT');
      } else {
        let errorMsg = 'Erro ao gerar cobrança PIX.';
        try {
          const errJson = await response.json();
          if (errJson.message) {
            errorMsg = errJson.message;
          }
        } catch (e) {
          // Mantém mensagem padrão
        }
        setError(errorMsg);
      }
    } catch (err) {
      setError('Não foi possível conectar ao servidor PetVida. Verifique se a API backend está em execução.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopyPix() {
    if (donationData !== null) {
      if (donationData.pixCopyPaste) {
        navigator.clipboard.writeText(donationData.pixCopyPaste);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 3000);
      }
    }
  }

  function handleReset() {
    setStep('SELECT');
    setPresetAmount(30);
    setCustomAmount('');
    setError(null);
    setDonationData(null);
    setCopied(false);
  }

  useEffect(() => {
    if (step !== 'PAYMENT') {
      return;
    }
    if (donationData === null) {
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const donationId = donationData.id;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(baseUrl + '/api/donations/' + donationId);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'PAID') {
            setStep('SUCCESS');
          } else if (data.status === 'EXPIRED') {
            setStep('EXPIRED');
          }
        }
      } catch (e) {
        // Erro transiente de rede: ignora e tenta no próximo ciclo
      }
    }, 3000);

    const timerInterval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setStep('EXPIRED');
          return 0;
        } else {
          return prev - 1;
        }
      });
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timerInterval);
    };
  }, [step, donationData]);

  function renderPresetButton(amount: number, livesText: string) {
    const isSelected = presetAmount === amount;
    let btnClass = '';
    let livesBadgeClass = '';

    if (isSelected) {
      btnClass =
        'w-full py-3.5 px-3 rounded-2xl font-black text-white bg-emerald-600 border-2 border-emerald-600 shadow-md shadow-emerald-600/20 transition flex flex-col items-center justify-center gap-0.5';
      livesBadgeClass = 'text-[11px] font-bold text-emerald-100 bg-emerald-700/60 px-2 py-0.5 rounded-full mt-1';
    } else {
      btnClass =
        'w-full py-3.5 px-3 rounded-2xl font-bold text-slate-800 bg-slate-50 border border-slate-200 hover:border-emerald-500/50 hover:bg-emerald-50/50 transition flex flex-col items-center justify-center gap-0.5';
      livesBadgeClass = 'text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full mt-1';
    }

    return (
      <button
        key={amount}
        type="button"
        onClick={() => handlePresetClick(amount)}
        className={btnClass}
      >
        <span className="text-base font-extrabold">R$ {amount}</span>
        <span className={livesBadgeClass}>{livesText}</span>
      </button>
    );
  }

  function renderSocialProofHeader() {
    return (
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shadow-sm">MS</div>
            <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shadow-sm">CE</div>
            <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-emerald-700 text-white font-black text-[10px] flex items-center justify-center shadow-sm">AP</div>
            <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-teal-700 text-white font-black text-[10px] flex items-center justify-center shadow-sm">LM</div>
          </div>
          <div className="text-left">
            <div className="text-xs font-black text-slate-900 flex items-center gap-1">
              <span>+342 doadores</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded-full">hoje</span>
            </div>
            <span className="text-[11px] text-slate-500 block">Juntos já salvaram 1.280 animais</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span>14 doando agora</span>
        </div>
      </div>
    );
  }

  function renderCampaignGoalBar() {
    return (
      <div className="space-y-1.5 bg-emerald-50/60 border border-emerald-100 p-3 rounded-2xl">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-800 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Meta PetVida: Ração & Remédios
          </span>
          <span className="text-emerald-700 font-black">78% alcançado</span>
        </div>
        <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
          <div className="bg-emerald-600 h-2 rounded-full transition-all duration-500 w-[78%]"></div>
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 font-medium">
          <span>780 kg de ração garantidos</span>
          <span className="font-bold text-slate-700">Faltam 220 kg</span>
        </div>
      </div>
    );
  }

  function renderLiveDonationTicker() {
    const current = RECENT_DONATIONS[liveIndex];

    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-2.5 flex items-center justify-between text-xs transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
            ❤️
          </div>
          <div>
            <span className="font-bold text-slate-900">{current.name}</span>
            <span className="text-slate-500"> doou </span>
            <span className="font-extrabold text-emerald-700">{current.amount}</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">{current.timeAgo}</div>
      </div>
    );
  }

  function renderImpactBanner() {
    const cents = getSelectedAmountCents(presetAmount, customAmount);
    const impactText = getImpactDescription(cents);

    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-emerald-950 text-xs leading-relaxed">
        <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-emerald-900 block mb-0.5">Seu Impacto no PetVida:</span>
          <span className="font-medium text-emerald-800">{impactText}</span>
        </div>
      </div>
    );
  }

  function renderErrorAlert() {
    if (error !== null) {
      return (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2 text-rose-600 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      );
    } else {
      return null;
    }
  }

  function renderSubmitButtonContent() {
    if (loading) {
      return (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Gerando PIX Seguro...</span>
        </>
      );
    } else {
      return (
        <>
          <Heart className="w-5 h-5 fill-white" />
          <span>Salvar Vidas com PetVida</span>
        </>
      );
    }
  }

  function renderCopyButton() {
    if (copied) {
      return (
        <button
          type="button"
          disabled
          className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md"
        >
          <Check className="w-4 h-4" />
          <span>Código Copiado com Sucesso!</span>
        </button>
      );
    } else {
      return (
        <button
          type="button"
          onClick={handleCopyPix}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20"
        >
          <Copy className="w-4 h-4" />
          <span>Copiar código PIX</span>
        </button>
      );
    }
  }

  function renderQrCodeImage(base64: string | undefined) {
    if (base64) {
      let imageSrc = base64;
      if (!base64.startsWith('data:image')) {
        imageSrc = 'data:image/png;base64,' + base64;
      }
      return (
        <img
          src={imageSrc}
          alt="QR Code PIX PetVida para doação"
          className="w-full h-auto rounded-lg"
        />
      );
    } else {
      return (
        <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">
          QR Code indisponível
        </div>
      );
    }
  }

  function renderScreen() {
    if (step === 'SUCCESS') {
      return (
        <div className="text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Muito obrigado por salvar vidas no PetVida! 🐾</h2>
            <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
              Sua doação foi confirmada com sucesso! Ela será convertida diretamente em ração, medicamentos e abrigo para os animais resgatados pelo PetVida.
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
            <span className="text-xs text-emerald-700 block uppercase font-bold tracking-wider mb-1">Valor doado com amor</span>
            <span className="text-3xl font-black text-emerald-700">
              {donationData ? formatCentsToBRL(donationData.amountCents) : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            Fazer outra doação
          </button>
        </div>
      );
    } else if (step === 'EXPIRED') {
      return (
        <div className="text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto border-2 border-rose-300">
            <Clock className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">PIX expirado</h2>
            <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
              O tempo de 30 minutos para pagamento deste PIX expirou, mas os animais do PetVida ainda precisam da sua ajuda!
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl border border-slate-800 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-emerald-500" />
            <span>Gerar novo PIX</span>
          </button>
        </div>
      );
    } else if (step === 'PAYMENT') {
      return (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center space-y-1">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Valor da sua doação para o PetVida</span>
            <div className="text-3xl font-black text-emerald-600">
              {donationData ? formatCentsToBRL(donationData.amountCents) : ''}
            </div>
            <p className="text-xs text-emerald-700 font-semibold pt-1">
              {donationData ? getImpactDescription(donationData.amountCents) : ''}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-md max-w-[240px] mx-auto border-2 border-slate-200 flex items-center justify-center">
            {renderQrCodeImage(donationData?.qrCodeBase64)}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block text-center">
              Código PIX Copia e Cola
            </label>
            <div className="relative">
              <textarea
                readOnly
                rows={2}
                value={donationData?.pixCopyPaste || ''}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-mono resize-none focus:outline-none"
              />
            </div>
            {renderCopyButton()}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 text-xs font-semibold">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Expira em:</span>
            </div>
            <span className="font-mono font-bold text-amber-700 text-sm">
              {formatTimer(secondsLeft)}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>Aguardando confirmação do PIX...</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-5">
          {renderSocialProofHeader()}
          {renderCampaignGoalBar()}

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Escolha o valor e veja o seu impacto
            </label>
            <div className="grid grid-cols-2 gap-3">
              {renderPresetButton(15, 'Salva 1 vida 🐾')}
              {renderPresetButton(30, 'Salva 2 vidas 🐶')}
              {renderPresetButton(50, 'Salva 3 vidas 🐱')}
              {renderPresetButton(100, 'Salva 6 vidas 🐾')}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Ou digite outro valor (R$ 15 a R$ 1.000)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                R$
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={customAmount}
                onChange={handleCustomAmountChange}
                className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-bold text-base focus:outline-none transition shadow-sm"
              />
            </div>
          </div>

          {renderImpactBanner()}

          {renderLiveDonationTicker()}

          {renderErrorAlert()}

          <button
            type="button"
            onClick={handleGeneratePix}
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-base rounded-2xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            {renderSubmitButtonContent()}
          </button>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 relative overflow-hidden">
        {/* Header decoration */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <PawPrint className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">PetVida 🐾</h1>
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                Resgate & Proteção Animal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
            <Award className="w-3 h-3 text-amber-600" />
            <span>Selo PetVida</span>
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Sua doação é convertida diretamente em ração, vacinas e tratamento para animais necessitados.
          </p>
        </div>

        {renderScreen()}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Doação 100% segura via PIX</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>© 2026 PetVida</span>
          </div>
        </div>
      </div>
    </div>
  );
}