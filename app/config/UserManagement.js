'use client';

import { useState } from 'react';
import { inviteUser, deleteUser, resendInvite } from '@/app/actions/users';

export default function UserManagement({ initialUsers, currentUserId }) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  async function handleInvite(formData) {
    setLoading(true);
    setMsg('');
    setInviteLink('');
    const result = await inviteUser(formData);
    setLoading(false);

    if (result.success) {
      setMsg('Usuário convidado! Copie o link de acesso abaixo e envie diretamente para ele:');
      setInviteLink(result.inviteUrl);
      setShowForm(false);
    } else {
      setMsg(result.error);
    }
  }

  async function handleResend(userId) {
    setLoading(true);
    setMsg('');
    setInviteLink('');
    const result = await resendInvite(userId);
    setLoading(false);

    if (result.success) {
      setMsg('Novo link de convite gerado com sucesso! Copie-o abaixo:');
      setInviteLink(result.inviteUrl);
    } else {
      setMsg(result.error);
    }
  }

  async function handleDelete(userId) {
    if (!confirm('Deseja realmente remover este usuário do ministério?')) return;
    
    setLoading(true);
    const result = await deleteUser(userId);
    setLoading(false);

    if (result.success) {
      setMsg('Usuário removido.');
      setUsers(users.filter(u => u.id !== userId));
    } else {
      setMsg(result.error);
    }
  }

  return (
    <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--accent)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          👥 Gestão de Usuários
        </h3>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="primary" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
        >
          {showForm ? 'Fechar' : '+ Convidar Usuário'}
        </button>
      </div>

      {msg && (
        <div style={{ 
          marginBottom: '1rem', padding: '0.8rem 1rem', 
          background: (msg.includes('sucesso') || msg.includes('convidado') || inviteLink) ? 'rgba(100,255,218,0.08)' : 'rgba(255,77,77,0.08)',
          border: `1px solid ${(msg.includes('sucesso') || msg.includes('convidado') || inviteLink) ? 'rgba(100,255,218,0.2)' : 'rgba(255,77,77,0.2)'}`,
          borderRadius: '8px', color: (msg.includes('sucesso') || msg.includes('convidado') || inviteLink) ? 'var(--accent)' : '#ff4d4d', 
          fontSize: '0.85rem' 
        }}>
          {msg}
        </div>
      )}

      {inviteLink && (
        <div style={{ 
          marginBottom: '1.5rem', 
          padding: '1.2rem', 
          background: 'rgba(100,255,218,0.03)', 
          border: '1px solid rgba(100,255,218,0.15)', 
          borderRadius: '10px' 
        }}>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <input 
              type="text" 
              readOnly 
              value={inviteLink} 
              onClick={(e) => e.target.select()}
              style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--white)' }} 
            />
            <button 
              type="button" 
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
                alert('Link de convite copiado! 📋');
              }}
              style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', cursor: 'pointer', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}
            >
              Copiar
            </button>
            <button 
              type="button" 
              onClick={() => {
                setInviteLink('');
                setMsg('');
                window.location.reload();
              }}
              style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--white)', borderRadius: '6px', cursor: 'pointer' }}
            >
              Fechar &amp; Atualizar
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <form action={handleInvite} style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div><label style={{ fontSize: '0.75rem', color: 'var(--slate)', display: 'block', marginBottom: '0.3rem' }}>Nome</label><input name="firstName" placeholder="Nome" required /></div>
            <div><label style={{ fontSize: '0.75rem', color: 'var(--slate)', display: 'block', marginBottom: '0.3rem' }}>Sobrenome</label><input name="lastName" placeholder="Sobrenome" required /></div>
            <div><label style={{ fontSize: '0.75rem', color: 'var(--slate)', display: 'block', marginBottom: '0.3rem' }}>E-mail</label><input type="email" name="email" placeholder="email@exemplo.com" required /></div>
            <div><label style={{ fontSize: '0.75rem', color: 'var(--slate)', display: 'block', marginBottom: '0.3rem' }}>Telefone</label><input name="phone" placeholder="(00) 00000-0000" /></div>
          </div>
          <button type="submit" disabled={loading} className="primary" style={{ marginTop: '1.5rem', width: '100%', padding: '0.8rem' }}>
            {loading ? 'Enviando...' : 'Salvar e Enviar Convite 🔥'}
          </button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {users.map(u => (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'var(--light-slate)', fontWeight: '600' }}>
                {u.firstName} {u.lastName} <span style={{ fontSize: '0.7rem', color: 'var(--accent)', background: 'rgba(100,255,218,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem' }}>{u.role}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate)', marginTop: '0.2rem' }}>
                {u.email} {u.phone && `· ${u.phone}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => handleResend(u.id)}
                disabled={loading}
                style={{ background: 'transparent', border: '1px solid rgba(100,255,218,0.2)', color: 'var(--accent)', padding: '0.4rem 0.7rem', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                Reenviar
              </button>
              {u.id !== currentUserId && (
                <button 
                  onClick={() => handleDelete(u.id)}
                  disabled={loading}
                  style={{ background: 'transparent', border: '1px solid rgba(255,77,77,0.2)', color: '#ff4d4d', padding: '0.4rem 0.7rem', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer' }}
                >
                  Remover
                </button>
              )}
            </div>
          </div>
        ))}
        {users.length === 0 && <p style={{ color: 'var(--slate)', fontSize: '0.85rem', textAlign: 'center' }}>Nenhum usuário convidado ainda.</p>}
      </div>
    </div>
  );
}
