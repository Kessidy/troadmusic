'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/app/actions/auth';

const COUNTRIES = [
  { flag: '🇧🇷', name: 'Brasil', code: '+55' },
  { flag: '🇺🇸', name: 'Estados Unidos', code: '+1' },
  { flag: '🇵🇹', name: 'Portugal', code: '+351' },
  { flag: '🇦🇴', name: 'Angola', code: '+244' },
  { flag: '🇲🇿', name: 'Moçambique', code: '+258' },
  { flag: '🇨🇻', name: 'Cabo Verde', code: '+238' },
  { flag: '🇬🇧', name: 'Reino Unido', code: '+44' },
  { flag: '🇩🇪', name: 'Alemanha', code: '+49' },
  { flag: '🇫🇷', name: 'França', code: '+33' },
  { flag: '🇮🇹', name: 'Itália', code: '+39' },
  { flag: '🇪🇸', name: 'Espanha', code: '+34' },
  { flag: '🇦🇷', name: 'Argentina', code: '+54' },
  { flag: '🇨🇴', name: 'Colômbia', code: '+57' },
  { flag: '🇨🇱', name: 'Chile', code: '+56' },
  { flag: '🇲🇽', name: 'México', code: '+52' },
  { flag: '🇵🇾', name: 'Paraguai', code: '+595' },
  { flag: '🇺🇾', name: 'Uruguai', code: '+598' },
  { flag: '🇵🇪', name: 'Peru', code: '+51' },
  { flag: '🇧🇴', name: 'Bolívia', code: '+591' },
  { flag: '🇯🇵', name: 'Japão', code: '+81' },
  { flag: '🇨🇦', name: 'Canadá', code: '+1' },
  { flag: '🇦🇺', name: 'Austrália', code: '+61' },
  { flag: '🇿🇦', name: 'África do Sul', code: '+27' },
  { flag: '🇳🇬', name: 'Nigéria', code: '+234' },
  { flag: '🇨🇭', name: 'Suíça', code: '+41' },
  { flag: '🇳🇱', name: 'Holanda', code: '+31' },
  { flag: '🇧🇪', name: 'Bélgica', code: '+32' },
];

function CountrySelector({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
  );

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0 0.9rem', height: '48px',
          background: 'rgba(100,255,218,0.06)',
          border: '1px solid rgba(100,255,218,0.25)',
          borderRadius: '10px', cursor: 'pointer',
          color: 'var(--accent)', fontSize: '0.9rem', fontWeight: '600',
          whiteSpace: 'nowrap', transition: 'all 0.2s',
        }}
      >
        <span>{selected.flag}</span>
        <span>{selected.code}</span>
        <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>▼</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />

          {/* Dropdown */}
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0,
            background: '#112240', border: '1px solid rgba(100,255,218,0.2)',
            borderRadius: '10px', zIndex: 100, width: '260px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}>
            {/* Search */}
            <div style={{ padding: '0.7rem 0.8rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <input
                autoFocus
                placeholder="🔍 País ou código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', fontSize: '0.82rem', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            {/* List */}
            <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
              {filtered.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => { onSelect(c); setOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: '0.7rem', padding: '0.55rem 0.9rem',
                    background: selected.name === c.name ? 'rgba(100,255,218,0.08)' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(100,255,218,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = selected.name === c.name ? 'rgba(100,255,218,0.08)' : 'transparent'}
                >
                  <span style={{ fontSize: '1.1rem' }}>{c.flag}</span>
                  <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--light-slate)' }}>{c.name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: '600' }}>{c.code}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p style={{ padding: '1rem', textAlign: 'center', color: 'var(--slate)', fontSize: '0.8rem' }}>
                  País não encontrado
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]); // Brasil default
  const router = useRouter();

  const errorMessages = {
    BLOCKED: 'Sua conta está bloqueada. Entre em contato com o administrador.',
    SUSPENDED: 'A licença do seu ministério está suspensa. Entre em contato com o suporte.',
    EXPIRED: 'A licença do seu ministério expirou. Entre em contato com o suporte.',
    NO_LICENSE: 'Nenhuma licença encontrada. Entre em contato com o suporte.',
    CredentialsSignin: 'E-mail ou senha incorretos.',
    default: 'Ocorreu um erro. Tente novamente.',
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const form = new FormData(e.target);
    const res = await signIn('credentials', {
      email: form.get('email'),
      password: form.get('password'),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(errorMessages[res.error] || errorMessages.default);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const form = new FormData(e.target);
    if (form.get('password') !== form.get('confirmPassword')) {
      setError('As senhas não coincidem.'); setLoading(false); return;
    }
    form.set('phone', `${country.code} ${phone}`);
    const result = await registerUser(form);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess('Conta criada! Aguarde aprovação do administrador para acessar o sistema.');
      e.target.reset();
      setPhone('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent)', letterSpacing: '2px' }}>TROADMUSIC</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--slate)', marginTop: '4px', letterSpacing: '1px' }}>Tecnologia para o Reino</div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: '1.8rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {['login', 'register'].map((t) => (
              <button key={t} type="button" onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                style={{ flex: 1, padding: '0.7rem', background: 'transparent', border: 'none', borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent', color: tab === t ? 'var(--accent)' : 'var(--slate)', fontWeight: tab === t ? '700' : '400', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s', marginBottom: '-1px' }}>
                {t === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            ))}
          </div>

          {error && <div style={{ background: 'rgba(255,77,77,0.12)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1.2rem', fontSize: '0.85rem', color: '#ff6b6b' }}>{error}</div>}
          {success && <div style={{ background: 'rgba(100,255,218,0.1)', border: '1px solid rgba(100,255,218,0.3)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1.2rem', fontSize: '0.85rem', color: 'var(--accent)' }}>{success}</div>}

          {/* Login */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--slate)', display: 'block', marginBottom: '0.4rem' }}>E-mail</label>
                <input type="email" name="email" placeholder="seu@email.com" required style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--slate)', display: 'block', marginBottom: '0.4rem' }}>Senha</label>
                <input type="password" name="password" placeholder="••••••••" required style={{ width: '100%' }} />
              </div>
              <button type="submit" className="primary" disabled={loading} style={{ marginTop: '0.5rem', padding: '0.9rem', fontSize: '1rem', fontWeight: '600' }}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          {/* Register */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--slate)', display: 'block', marginBottom: '0.4rem' }}>Nome completo</label>
                <input type="text" name="name" placeholder="Seu nome" required style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--slate)', display: 'block', marginBottom: '0.4rem' }}>E-mail</label>
                <input type="email" name="email" placeholder="seu@email.com" required style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--slate)', display: 'block', marginBottom: '0.4rem' }}>Nome do Ministério / Congregação</label>
                <input type="text" name="ministry" placeholder="Ex: Igreja Central" required style={{ width: '100%' }} />
              </div>

              {/* Phone */}
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--slate)', display: 'block', marginBottom: '0.4rem' }}>
                  Telefone <span style={{ color: '#ff6b6b' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                  <CountrySelector selected={country} onSelect={(c) => { setCountry(c); setPhone(''); }} />
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    required
                    maxLength={15}
                    style={{ flex: 1 }}
                  />
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--slate)', marginTop: '0.3rem' }}>
                  {country.flag} {country.name} · {country.code} · ex: (11) 99999-9999
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--slate)', display: 'block', marginBottom: '0.4rem' }}>Senha</label>
                <input type="password" name="password" placeholder="Mínimo 6 caracteres" required minLength={6} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--slate)', display: 'block', marginBottom: '0.4rem' }}>Confirmar Senha</label>
                <input type="password" name="confirmPassword" placeholder="••••••••" required style={{ width: '100%' }} />
              </div>

              <button type="submit" className="primary" disabled={loading} style={{ marginTop: '0.5rem', padding: '0.9rem', fontSize: '1rem', fontWeight: '600' }}>
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>
              <p style={{ fontSize: '0.75rem', color: 'var(--slate)', textAlign: 'center', marginTop: '0.5rem' }}>
                Após criar a conta, um administrador precisará vinculá-la ao seu ministério.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
