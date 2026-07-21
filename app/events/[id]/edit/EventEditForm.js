'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
});

function MusicianEditRow({ musician, event }) {
  const isChecked = event.musicianAssignments?.some(ma => ma.musicianId === musician.id) || false;
  const [selected, setSelected] = useState(isChecked);
  const initialRoleId = event.musicianAssignments?.find(ma => ma.musicianId === musician.id)?.roleId || (musician.roles?.length === 1 ? musician.roles[0].id : null);

  return (
    <div key={musician.id} style={{ padding: '0.8rem', background: selected ? 'rgba(100,255,218,0.05)' : 'transparent', borderRadius: '8px', border: '1px solid', borderColor: selected ? 'rgba(100,255,218,0.2)' : 'transparent' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem', cursor: 'pointer' }}>
        <input
          type="checkbox"
          name="musicians"
          value={musician.id}
          checked={selected}
          onChange={(e) => setSelected(e.target.checked)}
          style={{ width: '18px', height: '18px' }}
        />
        <span style={{ fontWeight: '600' }}>{musician.firstName} {musician.lastName}</span>
      </label>
      
      {selected && musician.roles && musician.roles.length > 0 && (
        <div style={{ marginTop: '0.8rem', paddingLeft: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontSize: '0.70rem', color: 'var(--slate)', width: '100%' }}>Selecione o instrumento:</span>
          {musician.roles.map(r => (
            <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
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
    </div>
  );
}

export default function EventEditForm({ event, musicians, songs, departments, updateEventAction }) {
  const [selectedDate, setSelectedDate] = useState(
    event.eventDate ? dayjs(event.eventDate) : dayjs()
  );
  const [open, setOpen] = useState(false);

  const selectedSongIds = event.songs?.map(s => s.id) || [];

  // Separa Sonoplastas dos demais membros
  const soundTechs = musicians.filter(m =>
    m.roles?.some(r => r.name.toLowerCase().includes('sonoplasta') || r.name.toLowerCase().includes('som '))
  );
  const regularMembers = musicians.filter(m =>
    !m.roles?.every(r => r.name.toLowerCase().includes('sonoplasta') || r.name.toLowerCase().includes('som '))
  );

  return (
    <ThemeProvider theme={navyTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <form action={updateEventAction}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>
            {event.name}
          </h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1.5rem' }}>
            📍 {event.address}
          </p>

          <h2 style={{ fontSize: '1.2rem' }}>Data e Hora</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
            <DateTimePicker
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              open={open}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  required: true,
                  onClick: () => setOpen(true),
                },
              }}
            />
            <input type="hidden" name="eventDate" value={selectedDate?.toISOString() || ''} />
          </div>

          <h2 style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>Departamento</h2>
          <div style={{ marginTop: '0.5rem' }}>
            <select name="departmentId" required defaultValue={event.departmentId || ""}>
              <option value="" disabled>Selecione o departamento...</option>
              {departments && departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {(!departments || departments.length === 0) && (
              <p style={{ fontSize: '0.8rem', color: '#ff4d4d', marginTop: '0.3rem' }}>
                Nenhum departamento cadastrado. Vá em Configurações.
              </p>
            )}
          </div>

          <h2 style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>Membros Escalados</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            {regularMembers.map(m => (
              <MusicianEditRow key={m.id} musician={m} event={event} />
            ))}
          </div>

          {soundTechs.length > 0 && (
            <>
              <h2 style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>🎛️ Sonoplastia &amp; Técnica</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'rgba(240,165,0,0.03)', borderRadius: '8px', border: '1px solid rgba(240,165,0,0.15)' }}>
                {soundTechs.map(m => (
                  <MusicianEditRow key={m.id} musician={m} event={event} />
                ))}
              </div>
            </>
          )}

          <h2 style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>Repertório</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.8rem', maxHeight: '200px', overflowY: 'auto', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            {songs.map(s => (
              <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="songs"
                  value={s.id}
                  defaultChecked={selectedSongIds.includes(s.id)}
                  style={{ width: 'auto' }}
                />
                <span>{s.title}</span>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="primary" style={{ flex: 1, padding: '1rem' }}>
              💾 Salvar Alterações
            </button>
            <Link href="/" style={{ flex: 1 }}>
              <button type="button" style={{ width: '100%', padding: '1rem', borderColor: '#ff4d4d', color: '#ff4d4d' }}>
                Cancelar
              </button>
            </Link>
          </div>
        </form>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
