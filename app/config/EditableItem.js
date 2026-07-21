'use client';

import React, { useState } from 'react';

export default function EditableItem({ item, onSave, onDelete, colors }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(item.name);
  const [tempColor, setTempColor] = useState(item.color || '#64ffda');

  async function handleSave() {
    if (!tempName.trim()) return;
    await onSave(item.id, tempName, tempColor);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--accent)' }}>
        <input 
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          placeholder="Nome"
          style={{ width: '100%' }}
          autoFocus
        />
        
        {colors && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {colors.map(c => (
              <div 
                key={c}
                onClick={() => setTempColor(c)}
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '4px', 
                  backgroundColor: c, 
                  cursor: 'pointer',
                  border: tempColor === c ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                  transform: tempColor === c ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s'
                }}
              />
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleSave} className="primary" style={{ flex: 1, padding: '0.5rem' }}>Salvar</button>
          <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '0.5rem', background: 'transparent' }}>Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        {item.color && (
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
        )}
        <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{item.name}</h3>
      </div>
      
      <div style={{ display: 'flex', gap: '0.8rem' }}>
        <button 
          onClick={() => setIsEditing(true)} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--accent)', 
            cursor: 'pointer',
            fontSize: '1.1rem',
            padding: '0.2rem'
          }}
          title="Editar"
        >
          ✏️
        </button>
        <button 
          onClick={async () => {
            if (confirm(`Tem certeza que deseja excluir "${item.name}"?`)) {
              await onDelete(item.id);
            }
          }} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: '#ff4d4d', 
            cursor: 'pointer',
            fontSize: '1.1rem',
            padding: '0.2rem'
          }}
          title="Excluir"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
