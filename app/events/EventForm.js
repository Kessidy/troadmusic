'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { checkRepertoireViolations } from '@/app/actions/events';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

const navyTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#64ffda' },
    background: { paper: '#112240', default: '#0a192f' },
    text: { primary: '#e6f1ff', secondary: '#8892b0' },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#112240',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            height: '48px',
          },
        },
      },
    },
  },
});

function MusicianRow({ musician, initialData }) {
  const isChecked = initialData?.musicianAssignments?.some(ma => ma.musicianId === musician.id) || false;
  const [selected, setSelected] = useState(isChecked);
  const initialRoleId = initialData?.musicianAssignments?.find(ma => ma.musicianId === musician.id)?.roleId || (musician.roles?.length === 1 ? musician.roles[0].id : null);

  return (
    <div key={musician.id} style={{ padding: '1rem', background: selected ? 'rgba(100,255,218,0.05)' : 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid', borderColor: selected ? 'rgba(100,255,218,0.2)' : 'transparent', transition: 'all 0.2s' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem', cursor: 'pointer' }}>
        <input 
          type="checkbox" 
          name="musicians" 
          value={musician.id} 
          checked={selected}
          onChange={(e) => setSelected(e.target.checked)}
          style={{ width: '20px', height: '20px' }} 
        />
        <span style={{ color: 'var(--white)', fontWeight: '600' }}>
          {musician.firstName} {musician.lastName}
        </span>
      </label>
      
      {selected && musician.roles && musician.roles.length > 0 && (
        <div style={{ marginTop: '0.8rem', paddingLeft: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate)', width: '100%' }}>Selecione o instrumento:</span>
          {musician.roles.map(r => (
            <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--light-slate)' }}>
              <input 
                type="radio" 
                name={`role_for_${musician.id}`} 
                value={r.id} 
                defaultChecked={initialRoleId === r.id}
                required={selected}
              />
              {r.name}
            </label>
          ))}
        </div>
      )}
      {selected && (!musician.roles || musician.roles.length === 0) && (
        <p style={{ fontSize: '0.75rem', color: '#ff4d4d', marginTop: '0.5rem', paddingLeft: '2rem' }}>
          ⚠️ Este músico não tem instrumentos cadastrados.
        </p>
      )}
    </div>
  );
}

export default function EventForm({ musicians, songs, departments, createEventAction, initialData }) {
  const [selectedDate, setSelectedDate] = useState(initialData?.eventDate ? dayjs(initialData.eventDate) : dayjs());
  const [open, setOpen] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const [recurrenceDays, setRecurrenceDays] = useState('');
  const [recurrenceEnd, setRecurrenceEnd] = useState(null);

  const estimatedEvents = recurrenceDays > 0 && recurrenceEnd && selectedDate
    ? Math.floor(recurrenceEnd.diff(selectedDate, 'day') / parseInt(recurrenceDays))
    : 0;

  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const randomizeRef = formData.get('randomizeRepertoire');
    const songIds = formData.getAll('songs');
    const evtDate = formData.get('eventDate');

    if (!randomizeRef && songIds.length > 0 && evtDate) {
      const res = await checkRepertoireViolations(songIds, evtDate);
      if (res.violations && res.violations.length > 0) {
        if (!confirm(`Atenção: As seguintes músicas foram tocadas recentemente e violam a regra de dias configurada:\n\n${res.violations.map(v => `- ${v}`).join('\n')}\n\nDeseja salvar o evento mesmo assim?`)) {
          return;
        }
      }
    }
    
    startTransition(() => {
      createEventAction(formData);
    });
  };

  const isSongSelected = (id) => initialData?.songs?.some(s => s.id === id);
  const [selectedDeptId, setSelectedDeptId] = useState(initialData?.departmentId || "");

  // Separa Sonoplastas (membros com função "sonoplasta") dos demais
  const allFiltered = selectedDeptId
    ? musicians.filter(m => m.departments?.some(d => d.id === selectedDeptId))
    : musicians;

  const soundTechs = allFiltered.filter(m =>
    m.roles?.some(r => r.name.toLowerCase().includes('sonoplasta') || r.name.toLowerCase().includes('som '))
  );
  const filteredMusicians = allFiltered.filter(m =>
    !m.roles?.every(r => r.name.toLowerCase().includes('sonoplasta') || r.name.toLowerCase().includes('som '))
  );

  return (
    <ThemeProvider theme={navyTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <form onSubmit={handleSubmit}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--light-slate)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
            📍 Informações Básicas
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--slate)', display: 'block', marginBottom: '0.5rem' }}>Nome do Evento</label>
              <input type="text" name="name" defaultValue={initialData?.name ? `${initialData.name} (Cópia)` : ''} placeholder="Ex: Culto de Domingo" required />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--slate)', display: 'block', marginBottom: '0.5rem' }}>Endereço / Local</label>
              <input type="text" name="address" defaultValue={initialData?.address || ''} placeholder="Ex: Sede" required />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--slate)', display: 'block', marginBottom: '0.5rem' }}>Departamento</label>
              <select 
                name="departmentId" 
                required 
                value={selectedDeptId} 
                onChange={(e) => setSelectedDeptId(e.target.value)}
              >
                <option value="" disabled>Selecione o departamento...</option>
                {departments && departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {(!departments || departments.length === 0) && (
                <p style={{ fontSize: '0.75rem', color: '#ff4d4d', marginTop: '0.3rem' }}>
                  Nenhum departamento cadastrado. Vá em Configurações.
                </p>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--slate)' }}>Data e Hora</label>
              <DateTimePicker
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    onClick: () => setOpen(true),
                    inputProps: { readOnly: true }
                  },
                }}
              />
              <input type="hidden" name="eventDate" value={selectedDate?.toISOString() || ''} />
            </div>
          </div>

          <h2 style={{ fontSize: '1.2rem', color: 'var(--light-slate)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
            🔁 Recorrência (opcional)
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(100,255,218,0.03)', borderRadius: '12px', border: '1px solid rgba(100,255,218,0.1)' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--slate)', display: 'block', marginBottom: '0.5rem' }}>Repetir a cada (dias)</label>
              <input
                type="number"
                name="recurrenceDays"
                placeholder="Ex: 7 para semanal"
                min="0"
                value={recurrenceDays}
                onChange={e => setRecurrenceDays(e.target.value)}
              />
            </div>
            
            {parseInt(recurrenceDays) > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--slate)' }}>Data Limite das Repetições</label>
                <DateTimePicker
                  value={recurrenceEnd}
                  onChange={(newValue) => setRecurrenceEnd(newValue)}
                  open={openEnd}
                  onOpen={() => setOpenEnd(true)}
                  onClose={() => setOpenEnd(false)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      onClick: () => setOpenEnd(true),
                      inputProps: { readOnly: true }
                    },
                  }}
                />
                <input type="hidden" name="recurrenceEnd" value={recurrenceEnd?.toISOString() || ''} />
                {estimatedEvents > 0 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: '0.3rem', fontWeight: '600' }}>
                    ✨ Isso criará {estimatedEvents} eventos no futuro.
                  </p>
                )}
              </div>
            )}
            {(!recurrenceDays || parseInt(recurrenceDays) === 0) && (
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--slate)', fontSize: '0.85rem', opacity: 0.6 }}>
                Sem repetição automática selecionada.
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', color: 'var(--light-slate)', marginBottom: '1rem' }}>🎵 Membros Escalados</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', padding: '1.2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                {filteredMusicians.map(m => (
                  <MusicianRow key={m.id} musician={m} initialData={initialData} />
                ))}
                {filteredMusicians.length === 0 && (
                   <p style={{ textAlign: 'center', color: 'var(--slate)', fontSize: '0.8rem', padding: '1rem' }}>
                     Nenhum membro neste departamento.
                   </p>
                )}
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: '1.1rem', color: 'var(--light-slate)', marginBottom: '1rem' }}>🎶 Repertório do Dia</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem', maxHeight: '250px', overflowY: 'auto', padding: '1.2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                {songs.map(s => (
                  <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.85rem', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} className="hover-highlight">
                    <input type="checkbox" name="songs" value={s.id} defaultChecked={isSongSelected(s.id)} style={{ width: '18px', height: '18px' }} />
                    <span style={{ color: 'var(--white)' }}>{s.title}</span>
                  </label>
                ))}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '1rem', padding: '1rem', background: 'rgba(100,255,218,0.05)', border: '1px solid rgba(100,255,218,0.2)', borderRadius: '8px', cursor: 'pointer' }}>
                <input type="checkbox" name="randomizeRepertoire" value="true" style={{ width: '18px', height: '18px' }}/>
                <span style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 'bold' }}>🎲 Gerar Repertório Aleatório Automaticamente<br/><small style={{ fontWeight: 'normal', color: 'var(--slate)' }}>(Ativa seleção de músicas aleatórias respeitando o limite de dias nas configurações)</small></span>
              </label>
            </div>
          </div>

          {/* Seção Sonoplastia & Técnica */}
          {soundTechs.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--light-slate)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
                🎛️ Sonoplastia &amp; Técnica
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.2rem', background: 'rgba(240,165,0,0.03)', borderRadius: '10px', border: '1px solid rgba(240,165,0,0.15)' }}>
                {soundTechs.map(m => (
                  <MusicianRow key={m.id} musician={m} initialData={initialData} />
                ))}
              </div>
            </div>
          )}

          {/* Seção de Notificações */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--light-slate)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
              📣 Notificações de Escala
            </h2>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', background: 'rgba(100,255,218,0.05)', border: '1px solid rgba(100,255,218,0.2)', borderRadius: '8px', cursor: 'pointer' }}>
              <input type="checkbox" name="sendNotifications" value="true" defaultChecked style={{ width: '18px', height: '18px' }}/>
              <span style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 'bold' }}>⚡ Notificar Voluntários Escalados via Telegram<br/><small style={{ fontWeight: 'normal', color: 'var(--slate)' }}>(Ao salvar, envia automaticamente os detalhes do evento, local e repertório via Telegram para cada membro escalado)</small></span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
            <button type="submit" className="primary" disabled={isPending} style={{ flex: 2, padding: '1rem', height: '54px', fontSize: '1rem', fontWeight: '600' }}>
              {isPending ? 'Salvando...' : 'Confirmar Agendamento'}
            </button>
            <Link href="/" style={{ flex: 1 }}>
              <button type="button" style={{ width: '100%', padding: '1rem', height: '54px', borderColor: '#ff4d4d', color: '#ff4d4d', fontSize: '1rem' }}>Cancelar</button>
            </Link>
          </div>
        </form>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
