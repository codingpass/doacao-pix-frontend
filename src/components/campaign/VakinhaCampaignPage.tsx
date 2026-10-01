'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PawPrint,
  Heart,
  Share2,
  Search,
  Volume2,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Users,
  Award,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface Donor {
  name: string;
  amount: string;
  timeAgo: string;
  comment?: string;
}

const RECENT_DONORS: Donor[] = [
  { name: 'Mariana Silva', amount: 'R$ 50,00', timeAgo: 'há 12 minutos', comment: 'Força para os gatinhos! Que todos se recuperem logo ❤️' },
  { name: 'Carlos Eduardo', amount: 'R$ 30,00', timeAgo: 'há 24 minutos', comment: 'Deus abençoe esse trabalho lindo de vocês.' },
  { name: 'Ana Paula Guimarães', amount: 'R$ 100,00', timeAgo: 'há 45 minutos', comment: 'Contem sempre com o meu apoio para o PetVida!' },
  { name: 'Lucas Mendes', amount: 'R$ 15,00', timeAgo: 'há 1 hora' },
  { name: 'Fernanda Rocha', amount: 'R$ 50,00', timeAgo: 'há 2 horas', comment: 'Salvando vidas indefesas! 🐾' },
];

const OTHER_STORIES = [
  {
    id: 1,
    title: 'Comprar prótese de patinha para o Rex',
    current: 'R$ 3.840,00',
    goal: 'de R$ 4.500',
    percent: 85,
    hearts: 142,
    image: '/rex-protese.png',
  },
  {
    id: 2,
    title: 'Campanha 10 Toneladas de Ração',
    current: 'R$ 28.450,00',
    goal: 'de R$ 30.000',
    percent: 94,
    hearts: 512,
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Cirurgia de urgência do cãozinho Bob',
    current: 'R$ 2.678,50',
    goal: 'de R$ 3.200',
    percent: 83,
    hearts: 98,
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: 'Ajude a Branquina: tratamento de esporotricose',
    current: 'R$ 1.424,00',
    goal: 'de R$ 1.800',
    percent: 79,
    hearts: 65,
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
  },
];

export default function VakinhaCampaignPage() {
  const [activeTab, setActiveTab] = useState<'sobre' | 'atualizacoes' | 'apoiadores' | 'selos'>('sobre');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  function handleShare() {
    if (typeof navigator !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: 'PetVida - Ajude no Tratamento dos Nossos Gatinhos e Cãezinhos',
          text: 'Conheça a campanha do PetVida e ajude a salvar animais resgatados!',
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    }
  }

  function toggleAudio() {
    setIsPlayingAudio(!isPlayingAudio);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 1. TOP NAVBAR (Estilo Vakinha Oficial) */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition">
                <PawPrint className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-emerald-700 leading-none">PetVida</span>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Vaquinha Oficial</span>
              </div>
            </Link>

            {/* Nav links (Desktop) */}
            <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-slate-600">
              <span className="cursor-pointer hover:text-emerald-600 transition flex items-center gap-1">
                Doar <span className="text-[10px]">▼</span>
              </span>
              <span className="cursor-pointer hover:text-emerald-600 transition flex items-center gap-1">
                Arrecadar <span className="text-[10px]">▼</span>
              </span>
              <span className="cursor-pointer hover:text-emerald-600 transition flex items-center gap-1">
                Sobre <span className="text-[10px]">▼</span>
              </span>
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200/70 px-3 py-2 rounded-full cursor-pointer transition">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Buscar</span>
            </div>

            <button className="hidden sm:block text-xs font-bold text-slate-700 hover:text-emerald-600 px-3 py-2 transition">
              Entrar
            </button>

            <Link
              href="/donate"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-full shadow-md shadow-emerald-600/20 transition hover:shadow-lg flex items-center gap-1.5"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Quero Ajudar</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LADO ESQUERDO: CONTEÚDO PRINCIPAL (8 Colunas) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Imagem Hero de Destaque */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 aspect-[16/10] sm:aspect-[16/9]">
              <img
                src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=85"
                alt="Gatinhos e Cãezinhos Resgatados"
                className="w-full h-full object-cover opacity-95"
              />
              
              {/* Overlay de Causa Urgente */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <PawPrint className="w-3 h-3" /> Resgate Urgente
                </span>
                <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20">
                  ID: 4293910
                </span>
              </div>

              {/* Selo Transparência Flutuante */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 border border-emerald-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Auditoria PetVida</span>
              </div>

              {/* Tarja inferior na imagem */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 text-white">
                <p className="text-xs sm:text-sm font-medium text-emerald-200">
                  🐾 Abrigo PetVida • 27 gatinhos e cães resgatados em tratamento médico
                </p>
              </div>
            </div>

            {/* Cabeçalho da Campanha */}
            <div className="space-y-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 tracking-wider uppercase">
                <span>ANIMAIS / PETS</span>
                <span>•</span>
                <span className="text-slate-400">Publicado em 22/09/2026</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                Ajude no Tratamento dos Nossos Gatinhos e Cãezinhos Resgatados
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Nos últimos dias, o Abrigo PetVida acolheu 27 animais em situação extrema de vulnerabilidade. 
                Eles precisam de internação urgente, vacinas antivirais, medicamentos e ração especial para sobreviverem.
              </p>

              {/* Botão de áudio / Acessibilidade */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-full transition"
                >
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>{isPlayingAudio ? 'Pausar áudio da história' : 'Ouvir a história desta vaquinha'}</span>
                </button>
              </div>
            </div>

            {/* Abas de Navegação (Sobre / Atualizações / Quem Ajudou / Selos) */}
            <div className="border-b border-slate-200 flex gap-1 sm:gap-4 overflow-x-auto text-sm font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('sobre')}
                className={`py-3 px-3 sm:px-4 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'sobre'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Sobre
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('atualizacoes')}
                className={`py-3 px-3 sm:px-4 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'atualizacoes'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Atualizações <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">3</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('apoiadores')}
                className={`py-3 px-3 sm:px-4 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'apoiadores'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Quem ajudou <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full">427</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('selos')}
                className={`py-3 px-3 sm:px-4 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'selos'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Selos recebidos
              </button>
            </div>

            {/* CONTEÚDO DAS ABAS */}
            {activeTab === 'sobre' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed">
                
                {/* Bloco de Apelo PIX Rápido */}
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-950">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      PIX
                    </div>
                    <span className="text-xs sm:text-sm font-semibold">
                      Você pode doar qualquer valor via PIX oficial com baixa automática instantânea!
                    </span>
                  </div>
                  <Link
                    href="/donate"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl transition flex-shrink-0 flex items-center gap-1 shadow-sm"
                  >
                    Doar via PIX Agora <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900">
                    A história por trás do resgate:
                  </h3>
                  <p>
                    Nos últimos dias, o <strong>Refúgio PetVida</strong> deparou-se com uma situação de extrema emergência.
                    Recebemos 27 animais resgatados de situações precárias. Entre eles, vários gatinhos filhotes com desnutrição severa,
                    gripe felina e verminoses graves, além de três cães idosos que necessitaram de internação clínica imediata.
                  </p>
                  <p>
                    Oito dos gatinhos testaram positivo para FELV e necessitam de acompanhamento médico contínuo, medicação e isolamento seguro
                    para não contagiar os demais abrigados.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <h4 className="font-black text-slate-900 flex items-center gap-2">
                    <span className="text-amber-500">💛</span> Nossa meta total: R$ 15.000,00
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Esse valor arrecadado é destinado 100% diretamente para:
                  </p>
                  <ul className="grid grid-cols-1 gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Internação e fluidoterapia dos casos mais graves
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Medicamentos diários, antibióticos e suplementos vitamínicos
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Testagem rápida de FIV/FELV e hemogramas completos
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Vacinação V4/V5 e antirrábica para imunização
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Ração super premium recovery para recuperação rápida de peso
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <p>
                    É um desafio imenso manter um refúgio independente sem apoio governamental. 
                    Cada centavo doado se transforma em esperança, tratamento digno e uma segunda chance para esses animaizinhos que já sofreram tanto.
                  </p>
                  <p className="font-bold text-emerald-800">
                    Se você não puder doar agora, compartilhe esta vaquinha com seus amigos e grupos. Toda ajuda faz uma diferença enorme! 🐾🐱🐶
                  </p>
                </div>

                {/* Banner de Doação no Fim do Texto */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    Causa Auditada pelo PetVida • 100% Transparente
                  </div>
                  <Link
                    href="/donate"
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-6 py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Quero Ajudar Agora</span>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'atualizacoes' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <h3 className="text-lg font-black text-slate-900">Atualizações da Campanha</h3>
                
                <div className="space-y-5 border-l-2 border-emerald-500 pl-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-600">Hoje às 14:30</span>
                    <h4 className="font-bold text-slate-900">Gatinho Mingau teve alta da UTI! 🎉</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Graças às doações que chegaram, o Mingau completou o ciclo de medicação e já está comendo sozinho!
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500">Ontem às 18:00</span>
                    <h4 className="font-bold text-slate-900">Chegada do primeiro lote de ração especial</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Compramos 120kg de ração recovery para os animais em recuperação nutricional. Prestação de contas anexada.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'apoiadores' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900">Quem já Ajudou (427 apoiadores)</h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Mais recentes
                  </span>
                </div>

                <div className="space-y-3">
                  {RECENT_DONORS.map((donor, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        ❤️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-slate-900">{donor.name}</span>
                          <span className="font-extrabold text-sm text-emerald-600">{donor.amount}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block">{donor.timeAgo}</span>
                        {donor.comment && (
                          <p className="text-xs text-slate-600 mt-1 italic font-medium">
                            "{donor.comment}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'selos' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <h3 className="text-lg font-black text-slate-900">Selos de Verificação & Auditoria</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                    <h4 className="font-bold text-emerald-950 text-sm">Identidade Verificada</h4>
                    <p className="text-xs text-emerald-800">
                      A organizadora da campanha enviou documentos de identificação oficiais e dados de localização do abrigo.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                    <Award className="w-8 h-8 text-blue-600" />
                    <h4 className="font-bold text-blue-950 text-sm">Prestação de Contas Aberta</h4>
                    <p className="text-xs text-blue-800">
                      Todas as notas fiscais dos atendimentos veterinários e compras de medicamentos são publicadas publicamente.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* LADO DIREITO: CARD FLUTUANTE DE DOAÇÃO (4 Colunas) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            
            <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200 space-y-5">
              
              {/* Valor Arrecadado e Meta */}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Arrecadado
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
                    R$ 14.613,09
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mt-1">
                  <span>de R$ 15.000,00</span>
                  <span className="font-bold text-emerald-700">97% alcançado</span>
                </div>
              </div>

              {/* Barra de Progresso Verde */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000 shadow-inner"
                  style={{ width: '97.4%' }}
                ></div>
              </div>

              {/* Estatísticas Rápidas (Corações & Apoiadores) */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 divide-y divide-slate-200/60 text-xs">
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    Corações Recebidos 💚
                  </span>
                  <span className="font-black text-slate-900">478</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    Apoiadores
                  </span>
                  <span className="font-black text-slate-900">427</span>
                </div>
              </div>

              {/* BOTÃO PRINCIPAL: QUERO AJUDAR */}
              <Link
                href="/donate"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-2xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
              >
                <Heart className="w-5 h-5 fill-white group-hover:scale-110 transition" />
                <span>Quero Ajudar</span>
              </Link>

              {/* Botão Secundário: Compartilhar */}
              <button
                type="button"
                onClick={handleShare}
                className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-slate-300 font-bold text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-xs"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Link da Vaquinha Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-slate-500" />
                    <span>Compartilhar</span>
                  </>
                )}
              </button>

              {/* Selo Causa Auditada */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200/60">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Campanha Auditada & Certificada pelo PetVida</span>
              </div>

              {/* Card da Criadora da Campanha */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0">
                  CR
                </div>
                <div className="min-w-0">
                  <span className="font-extrabold text-sm text-slate-900 block truncate">
                    Cris - Refúgio PetVida
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    no PetVida desde janeiro/2021
                  </span>
                </div>
              </div>

            </div>

            {/* Aviso de Transparência Extra */}
            <div className="text-center text-xs text-slate-400 leading-relaxed px-2">
              🔒 As doações são processadas via PIX seguro com notificação instantânea.
            </div>

          </div>

        </div>

        {/* 3. SEÇÃO: OUTRAS HISTÓRIAS TAMBÉM PRECISAM DE VOCÊ! */}
        <section className="mt-16 pt-12 border-t border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Outras histórias também precisam de você!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Conheça outros animais resgatados que aguardam tratamento e alimentação.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {OTHER_STORIES.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
              >
                <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-600 shadow-sm">
                    <Heart className="w-4 h-4 hover:fill-rose-500 hover:text-rose-500 transition cursor-pointer" />
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                      {story.title}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-extrabold text-emerald-600 text-sm">{story.current}</span>
                      <span className="text-slate-400 font-medium">{story.goal}</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${story.percent}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Corações recebidos</span>
                      <span className="font-bold text-emerald-700">{story.hearts} 💚</span>
                    </div>
                  </div>

                  <Link
                    href="/donate"
                    className="w-full py-2.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-1"
                  >
                    <span>Ajudar este pet</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 4. FOOTER INSTITUCIONAL */}
      <footer className="mt-20 bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-black text-base">
              <PawPrint className="w-5 h-5 text-emerald-500" />
              <span>PetVida</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Plataforma independente de apoio, tratamento e resgate de animais vulneráveis.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-white font-bold block mb-1">Links Rápidos</span>
            <Link href="/" className="block hover:text-white transition">Campanha Principal</Link>
            <Link href="/donate" className="block hover:text-white transition">Doar via PIX</Link>
            <span className="block hover:text-white transition cursor-pointer">Prestação de Contas</span>
          </div>

          <div className="space-y-2">
            <span className="text-white font-bold block mb-1">Segurança</span>
            <span className="block">Auditoria de Causa</span>
            <span className="block">Pagamento Criptografado</span>
            <span className="block">Privacidade Garantida</span>
          </div>

          <div className="space-y-2">
            <span className="text-white font-bold block mb-1">Atendimento</span>
            <span className="block">contato@petvida.org.br</span>
            <span className="block">Segunda a Sexta, 8h às 18h</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>© 2026 PetVida — Todos os direitos reservados.</div>
          <div className="flex items-center gap-4">
            <span>Termos de Uso</span>
            <span>Política de Privacidade</span>
            <span>Transparência</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
