'use client';

import React, { useState } from 'react';
import { updateMusician, deleteMusician } from '@/app/actions/musicians';

export default function MusicianList({ initialMusicians, roles, departments }) {
  const [editingId, setEditingId] = useState(null);
  const [editPhone, setEditPhone] = useState('');

  const formatPhone = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 3) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    }
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
  };

  const handleEdit = (m) => {
    setEditingId(m.id);
    setEditPhone(m.phone || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPhone('');
  };

  return (
    <div className="grid">
      {initialMusicians.map((m) => (
        <div key={m.id} className="card" style={{ position: 'relative' }}>
          {editingId === m.id ? (
            <form action={async (formData) => {
              await updateMusician(m.id, formData);
              setEditingId(null);
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input type="text" name="firstName" defaultValue={m.firstName} required placeholder="Nome" />
                <input type="text" name="lastName" defaultValue={m.lastName} required placeholder="Sobrenome" />
                <input type="email" name="email" defaultValue={m.email || ''} placeholder="E-mail (Opcional)" />
              </div>
              <div style={{ background: 'rgba(0,0,0,0.1)', padding: '0.8rem', borderRadius: '6px', marginBottom: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate)', marginBottom: '0.5rem' }}>Funções:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  {roles.map(role => (
                    <label key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        name="roleIds" 
                        value={role.id} 
                        defaultChecked={m.roles?.some(r => r.id === role.id)}
                        style={{ width: '14px', height: '14px' }}
                      />
                      <span>{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.1)', padding: '0.8rem', borderRadius: '6px', marginBottom: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate)', marginBottom: '0.5rem' }}>Departamentos:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  {departments.map(dept => (
                    <label key={dept.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        name="departmentIds" 
                        value={dept.id} 
                        defaultChecked={m.departments?.some(d => d.id === dept.id)}
                        style={{ width: '14px', height: '14px' }}
                      />
                      <span>{dept.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <input 
                type="text" 
                name="phone" 
                value={editPhone} 
                onChange={(e) => setEditPhone(formatPhone(e.target.value))}
                required 
                placeholder="Telefone" 
                style={{ marginBottom: '0.8rem' }} 
                maxLength={15}
              />
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Salvar</button>
                <button type="button" onClick={cancelEdit} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Cancelar</button>
              </div>
            </form>
          ) : (
            <>
              <h3>{m.firstName} {m.lastName}</h3>
              <div style={{ color: 'var(--accent)', marginTop: '0.5rem', fontWeight: '600', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {m.roles?.map(role => (
                    <span key={role.id} style={{ fontSize: '0.8rem', background: 'rgba(100,255,218,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {role.name}
                    </span>
                  ))}
                  {(!m.roles || m.roles.length === 0) && <span>Sem função</span>}
                </div>
                {m.departments?.map(dept => (
                  <span key={dept.id} style={{ 
                    fontSize: '0.7rem', 
                    background: `${dept.color}20`, 
                    color: dept.color, 
                    padding: '0.1rem 0.4rem', 
                    borderRadius: '4px',
                    border: `1px solid ${dept.color}`
                  }}>
                    {dept.name}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{m.phone}</p>
              {m.email && <p style={{ fontSize: '0.9rem', marginTop: '0.2rem', color: 'var(--slate)' }}>{m.email}</p>}
              
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {m.telegramChatId ? (
                  <span style={{ fontSize: '0.75rem', color: '#7ee787', background: 'rgba(126,231,135,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    🟢 Telegram Ativo
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#ff7b72', background: 'rgba(255,123,114,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} title="Inicie o Bot do Telegram e compartilhe o contato para ativar">
                    🔴 Telegram Inativo
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem', alignItems: 'center' }}>
                <button 
                  onClick={() => handleEdit(m)}
                  style={{ 
                    borderColor: 'var(--accent)', 
                    color: 'var(--accent)', 
                    padding: '0.4rem 0.8rem', 
                    fontSize: '0.8rem',
                    background: 'transparent'
                  }}
                >
                  Editar
                </button>
                <form action={deleteMusician.bind(null, m.id)} style={{ display: 'inline' }} onSelect={(e) => { if(!confirm('Excluir membro?')) e.preventDefault(); }}>
                  <button 
                    type="submit" 
                    style={{ 
                      borderColor: '#ff4d4d', 
                      color: '#ff4d4d', 
                      padding: '0.4rem 0.8rem', 
                      fontSize: '0.8rem',
                      background: 'transparent'
                    }}
                  >
                    Excluir
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      ))}
      {initialMusicians.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--slate)', padding: '2rem' }}>Nenhum membro cadastrado.</p>}
    </div>
  );
}
