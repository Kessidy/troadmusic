'use client';

import React, { useState, useRef } from 'react';
import { createDepartment } from '@/app/actions/departments';

const COLORS = [
  '#64ffda', // Teal (Accent)
  '#ff4d4d', // Red
  '#4d79ff', // Blue
  '#ffcc00', // Yellow
  '#ff8000', // Orange
  '#cc33ff', // Purple
  '#33cc33', // Green
  '#ff3399', // Pink
  '#00d9ff', // Cyan
  '#a8b2d1', // Slate
];

export default function DepartmentForm() {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [error, setError] = useState(null);
  const formRef = useRef(null);

  const handleSubmit = async (formData) => {
    setError(null);
    const result = await createDepartment(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      formRef.current?.reset();
    }
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Gerenciar Departamentos</h2>
      <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--slate)' }}>
        Cadastre os departamentos e escolha uma cor para identificação.
      </p>

      {error && (
        <div style={{ background: 'rgba(255, 77, 77, 0.1)', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      <form ref={formRef} action={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              name="name" 
              placeholder="Ex: Jovens" 
              required 
              style={{ flex: 1 }}
            />
            <input type="hidden" name="color" value={selectedColor} />
            <button type="submit" className="primary">Adicionar Departamento</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--slate)' }}>Cor de Identificação:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
              {COLORS.map(color => (
                <div
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: selectedColor === color ? '3px solid white' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: selectedColor === color ? '0 0 10px rgba(255,255,255,0.3)' : 'none',
                    transition: 'all 0.2s ease',
                    transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)'
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
