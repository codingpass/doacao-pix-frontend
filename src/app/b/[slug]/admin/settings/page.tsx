'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Palette,
  Globe,
  MapPin,
  Phone,
  Image as ImageIcon,
  Save,
  Loader2,
  Check,
  HelpCircle,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#D97706');
  const [secondaryColor, setSecondaryColor] = useState('#0F172A');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [customDomain, setCustomDomain] = useState('');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok) {
        setTenant(data);
        setName(data.name || '');
        setPrimaryColor(data.primaryColor || '#D97706');
        setSecondaryColor(data.secondaryColor || '#0F172A');
        setLogoUrl(data.logoUrl || '');
        setBannerUrl(data.bannerUrl || '');
        setBio(data.bio || '');
        setAddress(data.address || '');
        setPhone(data.phone || '');
        setCustomDomain(data.customDomain || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          primaryColor,
          secondaryColor,
          logoUrl: logoUrl.trim() || null,
          bannerUrl: bannerUrl.trim() || null,
          bio: bio.trim() || null,
          address: address.trim() || null,
          phone: phone.trim() || null,
          customDomain: customDomain.trim() || null,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-500" /> Identidade Visual & Configurações
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalize a aparência, domínio próprio e informações de contato da barbearia.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-amber-600/20 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Salvar Configurações
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-green-950/40 border border-green-800/50 rounded-xl text-green-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" /> Configurações salvas com sucesso!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identidade Visual & Cores */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Palette className="w-5 h-5 text-amber-500" /> Cores da Marca (Paleta)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cor Primária (Botões, Destaques, Ícones)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer bg-slate-950 border border-slate-700 p-1"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-mono w-32 outline-none uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cor Secundária (Fundos de Seções, Cards)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer bg-slate-950 border border-slate-700 p-1"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-mono w-32 outline-none uppercase"
                />
              </div>
            </div>
          </div>

          {/* Preview em Tempo Real */}
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
              Pré-visualização dos Componentes:
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                style={{ backgroundColor: primaryColor }}
                className="px-4 py-2 text-slate-950 font-extrabold text-xs rounded-xl shadow transition"
              >
                Botão Agendar
              </button>
              <span
                style={{ color: primaryColor, borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}15` }}
                className="px-3 py-1 text-xs font-bold rounded-full border"
              >
                R$ 60,00 • Confirmado
              </span>
            </div>
          </div>
        </div>

        {/* Domínio Personalizado */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Globe className="w-5 h-5 text-amber-500" /> Domínio Próprio (.com.br)
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Domínio Registrado (ex: Hostinger / Registro.br)
              </label>
              <input
                type="text"
                placeholder="ex: barbearialima.com.br"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-amber-500"
              />
            </div>

            <div className="bg-slate-950/70 border border-slate-850 rounded-xl p-3.5 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <HelpCircle className="w-4 h-4" /> Como configurar seu domínio:
              </div>
              <p>
                No painel da Hostinger (ou provedor onde comprou o domínio), acesse a <strong>Zona de DNS</strong> e crie uma entrada:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-slate-300 font-mono">
                <li>Tipo <strong>CNAME</strong> → Host: <strong>@</strong> (ou www) → Destino: <strong>seu-app.railway.app</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Informações da Barbearia */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <ImageIcon className="w-5 h-5 text-amber-500" /> Dados e Fotos da Barbearia
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Nome da Barbearia</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                placeholder="(11) 98765-4321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">Endereço Completo</label>
              <input
                type="text"
                placeholder="Ex: Av. Paulista, 1500 - Bela Vista, São Paulo - SP"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">URL do Logo</label>
              <input
                type="url"
                placeholder="https://..."
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">URL da Imagem de Fundo (Banner)</label>
              <input
                type="url"
                placeholder="https://..."
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">Texto de Apresentação / Bio</label>
              <textarea
                rows={3}
                placeholder="Breve história ou slogan da barbearia..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
