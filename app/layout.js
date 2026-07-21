import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'TROADMUSIC - Tecnologia para o Reino',
  description: 'Soluções tecnológicas para fortalecer o ministério e a obra de Deus.',
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="pt-BR">
      <body>
        <SessionProvider session={session}>
          <Navbar />
          <main>{children}</main>
          <footer>
            <div className="footer-logo">TROADTEC</div>
            <p>Todos os direitos reservados a TROADTEC Segurança e Tecnologia Ltda.</p>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
