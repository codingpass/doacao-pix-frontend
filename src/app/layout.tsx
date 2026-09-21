import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BarberSaaS - Plataforma de Gestão & Agendamento para Barbearias',
  description: 'Sistema completo de agendamento online e gestão para barbearias de alto padrão no Brasil.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
