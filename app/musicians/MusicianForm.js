'use client';

import React, { useState } from 'react';
import { createMusician } from '@/app/actions/musicians';

export default function MusicianForm({ roles, departments }) {
  const [phone, setPhone] = useState('');

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

  const handlePhoneChange = (e) => {
    const formattedValue = formatPhone(e.target.value);
    setPhone(formattedValue);
  };

  return (
    <div className="card" style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ marginBottom: '1.2rem', fontSize: '1.2rem', color: 'var(--light-slate)' }}>Novo Membro</h2>
      <form action={createMusician} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', alignItems: 'end' }}>
        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--slate)', display: 'block', marginBottom: '0.4rem' }}>Nome</label>
          <input type="text" name="firstName" placeholder="Nome" required />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--slate)', display: 'block', marginBottom: '0.4rem' }}>Sobrenome</label>
          <input type="text" name="lastName" placeholder="Sobrenome" required />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--slate)', display: 'block', marginBottom: '0.4rem' }}>E-mail</label>
          <input type="email" name="email" placeholder="E-mail (Opcional)" />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--slate)', display: 'block', marginBottom: '0.4rem' }}>Telefone</label>
          <input 
            type="text" 
            name="phone" 
            placeholder="(00) 00000-0000" 
            value={phone}
            onChange={handlePhoneChange}
            required 
            maxLength={15}
          />
        </div>
        <div style={{ gridColumn: '1 / -1', background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--slate)', display: 'block', marginBottom: '0.8rem' }}>Funções no Ministério (Instrumentos/Equipe Técnica)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.8rem' }}>
            {roles.map(role => (
              <label key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" name="roleIds" value={role.id} style={{ width: '16px', height: '16px' }} />
                <span>{role.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ gridColumn: '1 / -1', background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--slate)', display: 'block', marginBottom: '0.8rem' }}>Departamentos</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.8rem' }}>
            {departments.map(dept => (
              <label key={dept.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" name="departmentIds" value={dept.id} style={{ width: '16px', height: '16px' }} />
                <span>{dept.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
          <button type="submit" className="primary" disabled={roles.length === 0 || departments.length === 0} style={{ width: '100%', padding: '0.8rem' }} onClick={() => setTimeout(() => setPhone(''), 500)}>Salvar Membro</button>
          {(roles.length === 0 || departments.length === 0) && (
            <p style={{ fontSize: '0.8rem', color: '#ff4d4d', marginTop: '0.5rem', textAlign: 'center' }}>
              {roles.length === 0 ? 'Nenhuma função cadastrada.' : 'Nenhum departamento cadastrado.'} Vá em Configurações (⚙️) primeiro.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
