import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PetVida 🐾 - Doação PIX para Salvar Animais Necessitados',
  description: 'Sua doação na PetVida é convertida diretamente em ração, medicamentos e cuidados para animais resgatados.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="bg-slate-100 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}