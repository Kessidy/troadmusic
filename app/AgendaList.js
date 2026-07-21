'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { deleteEvent } from '@/app/actions/events';

export default function AgendaList({ initialEvents, departments }) {
  const [expandedId, setExpandedId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState('all');

  useEffect(() => {
    console.log('DEBUG: Departments:', departments);
    console.log('DEBUG: Selected Dept ID:', selectedDeptId);
    console.log('DEBUG: Initial Events:', initialEvents.map(e => ({ name: e.name, deptId: e.departmentId })));
  }, [selectedDeptId, departments, initialEvents]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredEvents = selectedDeptId === 'all' 
    ? initialEvents 
    : initialEvents.filter(e => e.departmentId === selectedDeptId);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>Troadmusic - Agenda</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Link href="/events">
            <button className="primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '10px' }}>➕ Novo Evento</button>
          </Link>
          <button 
            onClick={() => setShowFilter(!showFilter)}
            style={{ 
              background: showFilter ? 'var(--accent)' : 'rgba(255,255,255,0.05)', 
              color: showFilter ? '#000' : 'var(--accent)',
              border: '1px solid var(--accent)',
              padding: '0.8rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Filtrar por Departamento"
          >
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>☰</span>
          </button>
        </div>
      </div>

      {showFilter && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1.2rem', animation: 'fadeIn 0.3s ease-out', background: 'rgba(17, 34, 64, 0.8)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--light-slate)', marginBottom: '1rem', textTransform: 'uppercase' }}>Filtrar por Departamento:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            <button 
              onClick={() => setSelectedDeptId('all')}
              style={{ 
                padding: '0.5rem 1rem', 
                fontSize: '0.85rem',
                background: selectedDeptId === 'all' ? 'var(--accent)' : 'transparent',
                color: selectedDeptId === 'all' ? '#000' : 'var(--white)',
                borderColor: selectedDeptId === 'all' ? 'var(--accent)' : 'rgba(255,255,255,0.2)'
              }}
            >
              Todos
            </button>
            {departments.map(d => (
              <button 
                key={d.id}
                onClick={() => setSelectedDeptId(d.id)}
                style={{ 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.85rem',
                  background: selectedDeptId === d.id ? d.color : 'transparent',
                  color: selectedDeptId === d.id ? '#000' : 'var(--white)',
                  borderColor: selectedDeptId === d.id ? d.color : 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: selectedDeptId === d.id ? '#000' : d.color }}></span>
                {d.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid">
        {filteredEvents.map((e) => {
        const isExpanded = expandedId === e.id;
        
        return (
          <div key={e.id} className="card agenda-card" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.2rem', 
            height: '100%', 
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }} onClick={() => toggleExpand(e.id)}>
            
            {/* Header: Always visible */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ color: 'var(--accent)', fontSize: '1.4rem', margin: 0 }}>{e.name}</h2>
                {e.department && (
                  <div style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: `${e.department.color}15`, 
                    border: `1px solid ${e.department.color}`,
                    color: e.department.color,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    marginTop: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: e.department.color }}></span>
                    {e.department.name}
                  </div>
                )}
                <div className="mobile-only" style={{ marginTop: '0.5rem' }}>
                   {e.eventDate && (
                    <span style={{ fontSize: '0.9rem', color: 'var(--white)', fontWeight: '600' }}>
                      📅 {new Date(e.eventDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - {new Date(e.eventDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
              <div className="desktop-only-flex">
                 {e.eventDate && (
                  <p style={{ fontSize: '0.95rem', color: 'var(--white)', fontWeight: '600', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                    📅 {new Date(e.eventDate).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                )}
              </div>
              <div className="mobile-only" style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>
                {isExpanded ? '▲' : '▼'}
              </div>
            </div>

            {/* Address: Always visible on desktop, visible on expanded mobile */}
            <div className={`details-content ${isExpanded ? 'active' : ''}`}>
              <p style={{ fontSize: '0.9rem', color: 'var(--slate)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📍</span> {e.address}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '0.8rem', color: 'var(--light-slate)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Músicos Escalados</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {e.musicianAssignments?.map(ma => (
                      <span key={ma.id} style={{ background: 'var(--navy-lighter)', padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--accent-soft)', color: 'var(--accent)' }}>
                        {ma.musician.firstName} <small style={{ opacity: 0.7 }}>({ma.role?.name || 'Instrumento'})</small>
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '0.8rem', color: 'var(--light-slate)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Repertório</h3>
                  <ul style={{ listStyle: 'none', fontSize: '0.9rem', margin: 0, padding: 0 }}>
                    {e.songs.map(s => (
                      <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ color: 'var(--white)' }}>{s.title}</span>
                        <a href={s.youtubeLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: '600' }} onClick={(e) => e.stopPropagation()}>▶ YouTube</a>
                      </li>
                    ))}
                    {e.songs.length === 0 && <li style={{ fontSize: '0.85rem', color: 'var(--slate)' }}>Nenhuma música selecionada</li>}
                  </ul>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.8rem', flexWrap: 'wrap', paddingTop: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                  <Link href={`/events/${e.id}/edit`} style={{ flex: 1, minWidth: '90px' }}>
                    <button type="button" style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', background: 'transparent', borderColor: 'rgba(255,255,255,0.2)' }}>✏️ Editar</button>
                  </Link>
                  <form action={deleteEvent.bind(null, e.id)} style={{ flex: 1, minWidth: '90px' }}>
                    <button type="submit" style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', background: 'transparent', borderColor: '#ff4d4d', color: '#ff4d4d' }}>🗑️ Excluir</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {initialEvents.length === 0 && (
        <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--slate)' }}>Nenhum evento agendado para o momento.</p>
          <Link href="/events" style={{ display: 'inline-block', marginTop: '1.5rem', color: 'var(--accent)', fontWeight: '600' }}>Agendar meu primeiro evento →</Link>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .details-content {
            display: none;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
          }
          .details-content.active {
            display: block;
            margin-top: 1rem;
            animation: fadeIn 0.3s ease-in;
          }
          .mobile-only { display: block !important; }
          .desktop-only-flex { display: none !important; }
        }
        @media (min-width: 769px) {
          .details-content { display: block !important; }
          .mobile-only { display: none !important; }
          .desktop-only-flex { display: flex !important; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      </div>
    </>
  );
}
