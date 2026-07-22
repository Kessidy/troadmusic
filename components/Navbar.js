'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => { setIsMenuOpen(false); }, [pathname]);


  const getLinkStyle = (path) => ({
    color: pathname === path ? 'var(--slate)' : 'var(--accent)',
    fontWeight: pathname === path ? '600' : '400',
    transition: 'var(--transition)',
  });

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const isSuperAdmin = session?.user?.role === 'SUPERADMIN';

  return (
    <>
      <style>{`
        .login-btn-public {
          font-size: 0.9rem;
          font-weight: 600;
          padding: 0.4rem 1.2rem;
          background: transparent;
          color: var(--accent);
          border: 1px solid var(--accent);
          border-radius: 20px;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .login-btn-public:hover {
          background: rgba(100,255,218,0.1);
          transform: translateY(-1px);
        }
        .login-btn-public:active {
          color: #94a3b8; /* Cinza ao clicar */
          border-color: #94a3b8;
          background: transparent;
          transform: translateY(0);
        }

        .nav-link-public {
          font-size: 0.9rem;
          color: var(--accent);
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .nav-link-public:hover {
          color: #3ac0a6;
        }
        .nav-link-public:active {
          color: var(--slate);
        }
      `}</style>
      <nav style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'var(--glass)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', margin: '0 auto' }}>
          <div className="logo-container" style={{ marginRight: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {!pathname?.startsWith('/backoffice') ? (
              <Link href="/" className="logo" style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--accent)', letterSpacing: '1.5px' }}>
                TROADMUSIC
              </Link>
            ) : (
              <div className="logo" style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--accent)', letterSpacing: '1.5px', cursor: 'default' }}>
                TROADMUSIC
              </div>
            )}
          {session?.user?.tenantName && (
            <div className="slogan" style={{ fontSize: '0.7rem', color: 'var(--slate)', letterSpacing: '0.8px', marginTop: '2px' }}>
              {session.user.tenantName}
            </div>
          )}
        </div>

        {/* Desktop Links */}
        <div className="nav-links desktop-only" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {!pathname?.startsWith('/backoffice') && (
            <>
              {session ? (
                // Only show operational links for regular users/admins, NOT SuperAdmins
                !isSuperAdmin && (
                  <>
                    <Link href="/" style={getLinkStyle('/')}>Agenda</Link>
                    <Link href="/musicians" style={getLinkStyle('/musicians')}>Membros</Link>
                    <Link href="/repertorio" style={getLinkStyle('/repertorio')}>Repertório</Link>
                    <Link href="/contato" style={getLinkStyle('/contato')}>Contato Técnico</Link>
                    <Link href="/config" title="Configurações" style={{ fontSize: '1.2rem', marginLeft: '0.5rem', filter: pathname === '/config' ? 'grayscale(1)' : 'none' }}>⚙️</Link>
                    <Link href="/dashboard" style={getLinkStyle('/dashboard')}>Dashboard</Link>
                  </>
                )
              ) : (
                <>
                  <Link href="/#solucoes" className="nav-link-public">Soluções</Link>
                  <Link href="/#planos" className="nav-link-public">Preços e Planos</Link>
                  <Link href="/#contato" className="nav-link-public">Fale Conosco</Link>
                  <Link href="/login" className="login-btn-public">Fazer Login</Link>
                </>
              )}
            </>
          )}

          {isSuperAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Link href="/backoffice" style={{ ...getLinkStyle('/backoffice'), background: 'rgba(100,255,218,0.08)', padding: '0.3rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(100,255,218,0.2)', fontSize: '0.82rem' }}>
                🧑‍💼 Admin
              </Link>
              <Link href="/backoffice/pricing" title="Configuração Global de Preços" style={{ fontSize: '1.2rem', textDecoration: 'none' }}>⚙️</Link>
            </div>
          )}

          {/* User Menu */}
          {session && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ background: 'rgba(100,255,218,0.08)', border: '1px solid rgba(100,255,218,0.15)', borderRadius: '8px', padding: '0.35rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--light-slate)', fontSize: '0.82rem' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy)', fontWeight: '800', fontSize: '0.75rem' }}>
                  {session.user.name?.[0]?.toUpperCase() || '?'}
                </span>
                {session.user.name?.split(' ')[0]}
              </button>
              {showUserMenu && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'var(--navy-lighter)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem', minWidth: '160px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 2000 }}
                  onMouseLeave={() => setShowUserMenu(false)}>
                  <div style={{ padding: '0.5rem 0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--white)', fontWeight: '600' }}>{session.user.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--slate)', marginTop: '2px' }}>{session.user.email}</div>
                  </div>
                  <button onClick={handleLogout}
                    style={{ width: '100%', padding: '0.5rem 0.8rem', background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', borderRadius: '4px' }}>
                    🚪 Sair
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-only" onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ background: 'transparent', border: 'none', padding: '5px', cursor: 'pointer', display: 'none', flexDirection: 'column', gap: '5px' }}>
          <div style={{ width: '25px', height: '2px', background: 'var(--accent)', transition: '0.3s', transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : '' }} />
          <div style={{ width: '25px', height: '2px', background: 'var(--accent)', transition: '0.3s', opacity: isMenuOpen ? 0 : 1 }} />
          <div style={{ width: '25px', height: '2px', background: 'var(--accent)', transition: '0.3s', transform: isMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : '' }} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu" style={{ position: 'fixed', top: '70px', left: 0, right: 0, background: 'var(--navy-lighter)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderBottom: '1px solid var(--accent)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 999, animation: 'slideDown 0.3s ease' }}>
          {!pathname?.startsWith('/backoffice') && (
            <>
              {session ? (
                !isSuperAdmin && (
                  <>
                    <Link href="/" style={getLinkStyle('/')}>Agenda</Link>
                    <Link href="/musicians" style={getLinkStyle('/musicians')}>Gerenciar Membros</Link>
                    <Link href="/repertorio" style={getLinkStyle('/repertorio')}>Gerenciar Repertório</Link>
                    <Link href="/contato" style={getLinkStyle('/contato')}>Contato Técnico</Link>
                    <Link href="/config" style={getLinkStyle('/config')}>⚙️ Configurações</Link>
                    <Link href="/dashboard" style={getLinkStyle('/dashboard')}>Dashboard & Relatórios</Link>
                  </>
                )
              ) : (
                <>
                  <Link href="/#solucoes" className="nav-link-public" style={{ fontSize: '1rem' }}>Soluções</Link>
                  <Link href="/#planos" className="nav-link-public" style={{ fontSize: '1rem' }}>Preços & Planos</Link>
                  <Link href="/#contato" className="nav-link-public" style={{ fontSize: '1rem' }}>Fale Conosco</Link>
                  <Link href="/login" className="login-btn-public" style={{ fontSize: '1rem', textAlign: 'center', marginTop: '0.5rem' }}>Fazer Login</Link>
                </>
              )}
            </>
          )}
          {isSuperAdmin && (
            <>
              <Link href="/backoffice" style={getLinkStyle('/backoffice')}>🧑‍💼 Backoffice Admin</Link>
              <Link href="/backoffice/pricing" style={getLinkStyle('/backoffice/pricing')}>⚙️ Configurar Preços</Link>
            </>
          )}
          {session && <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', textAlign: 'left', fontSize: '1rem' }}>🚪 Sair</button>}
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 850px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </nav>
    </>
  );
}
