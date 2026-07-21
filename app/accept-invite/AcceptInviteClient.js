'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { acceptInvitation } from '@/app/actions/users';

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Token de convite não encontrado na URL.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await acceptInvitation(token, password);
      
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess('Senha definida com sucesso! Redirecionando para o login...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      setError('Ocorreu um erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return <div style={{ color: 'var(--slate)', textAlign: 'center' }}>Carregando...</div>;
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: '#64ffda', marginBottom: '1rem' }}>🎉 Bem-vindo!</h2>
        <p style={{ color: 'var(--slate)' }}>{success}</p>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '4rem auto', 
      padding: '2rem', 
      background: 'rgba(255,255,255,0.05)', 
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.1)' 
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#64ffda', margin: '0 0 0.5rem 0', letterSpacing: '1px' }}>TROADMUSIC</h1>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--white)', margin: 0 }}>Aceitar Convite</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--slate)', marginTop: '0.5rem' }}>Defina sua senha para acessar sua conta.</p>
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(255,77,77,0.1)', 
          color: '#ff6b6b', 
          padding: '1rem', 
          borderRadius: '8px', 
          border: '1px solid rgba(255,77,77,0.3)',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {token && !error?.includes('não encontrado') && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--slate)', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Nova Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha" 
              required 
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--slate)', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Confirmar Senha</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha" 
              required 
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              marginTop: '1rem', 
              background: '#64ffda', 
              color: '#0a192f', 
              padding: '1rem', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              width: '100%',
              fontSize: '1rem'
            }}
          >
            {loading ? 'Salvando...' : 'Salvar Senha e Entrar'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function AcceptInviteClient() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--slate)' }}>Carregando...</div>}>
      <AcceptInviteForm />
    </Suspense>
  );
}
