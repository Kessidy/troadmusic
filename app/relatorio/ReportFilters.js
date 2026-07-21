'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            height: '48px',
            borderRadius: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            paddingRight: '8px',
            '& input': {
              textAlign: 'center',
              cursor: 'pointer',
              height: '48px',
              padding: '0 14px',
              fontSize: '1rem',
            },
          },
        },
      },
    },
  },
});

export default function ReportFilters({ statusFilter, dateFrom, dateTo, departmentId, departments }) {
  const [mounted, setMounted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState(dateFrom ? dayjs(dateFrom) : null);
  const [toDate, setToDate] = useState(dateTo ? dayjs(dateTo) : null);
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasActiveFilters = statusFilter || dateFrom || dateTo || departmentId;

  return (
    <ThemeProvider theme={navyTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <div>
          {/* Minimalist Filter Toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
            {(!showFilters && hasActiveFilters) && (
              <span style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'rgba(100,255,218,0.1)', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>
                Filtro Ativo
              </span>
            )}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: showFilters ? 'rgba(100,255,218,0.1)' : 'transparent',
                border: '1px solid rgba(100,255,218,0.2)',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
              title="Filtrar Resultados"
            >
              <div style={{ width: '22px', height: '2px', background: 'var(--accent)', borderRadius: '2px' }} />
              <div style={{ width: '22px', height: '2px', background: 'var(--accent)', borderRadius: '2px' }} />
              <div style={{ width: '22px', height: '2px', background: 'var(--accent)', borderRadius: '2px' }} />
            </button>
          </div>

          {/* Filters Row - Only visible when toggled */}
          {showFilters && (
            <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', animation: 'slideDown 0.3s ease' }}>
              <form method="GET" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1.5rem', 
                alignItems: 'end'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--slate)', fontWeight: '600', marginLeft: '0.2rem' }}>Status do Evento</label>
                  <select 
                    name="status" 
                    defaultValue={statusFilter} 
                    style={{ 
                      width: '100%', 
                      height: '48px', 
                      textAlign: 'center', 
                      textAlignLast: 'center',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      borderRadius: '10px',
                      padding: '0 1rem',
                      background: 'var(--navy-lighter)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: 'var(--white)'
                    }}
                  >
                    <option value="" style={{ background: 'var(--navy-lighter)', color: 'var(--white)' }}>Todos os Status</option>
                    <option value="ativo" style={{ background: 'var(--navy-lighter)', color: 'var(--white)' }}>🟡 Somente Ativos</option>
                    <option value="concluido" style={{ background: 'var(--navy-lighter)', color: 'var(--white)' }}>✅ Somente Concluídos</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--slate)', fontWeight: '600', marginLeft: '0.2rem' }}>🏢 Departamento</label>
                  <select 
                    name="departmentId" 
                    defaultValue={departmentId} 
                    style={{ 
                      width: '100%', 
                      height: '48px', 
                      textAlign: 'center', 
                      textAlignLast: 'center',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      borderRadius: '10px',
                      padding: '0 1rem',
                      background: 'var(--navy-lighter)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: 'var(--white)'
                    }}
                  >
                    <option value="" style={{ background: 'var(--navy-lighter)', color: 'var(--white)' }}>Todos os Departamentos</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id} style={{ background: 'var(--navy-lighter)', color: 'var(--white)' }}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--slate)', fontWeight: '600', marginLeft: '0.2rem' }}>📅 Data Inicial</label>
                  {mounted ? (
                    <>
                      <DatePicker
                        value={fromDate}
                        onChange={(newValue) => setFromDate(newValue)}
                        open={openFrom}
                        onOpen={() => setOpenFrom(true)}
                        onClose={() => setOpenFrom(false)}
                        slotProps={{ 
                          textField: { 
                            fullWidth: true,
                            onClick: () => setOpenFrom(true),
                            inputProps: { readOnly: true }
                          } 
                        }}
                      />
                      <input type="hidden" name="dateFrom" value={fromDate ? fromDate.format('YYYY-MM-DD') : ''} />
                    </>
                  ) : (
                    <div style={{ height: '48px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '10px' }} />
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--slate)', fontWeight: '600', marginLeft: '0.2rem' }}>📅 Data Final</label>
                  {mounted ? (
                    <>
                      <DatePicker
                        value={toDate}
                        onChange={(newValue) => setToDate(newValue)}
                        open={openTo}
                        onOpen={() => setOpenTo(true)}
                        onClose={() => setOpenTo(false)}
                        slotProps={{ 
                          textField: { 
                            fullWidth: true,
                            onClick: () => setOpenTo(true),
                            inputProps: { readOnly: true }
                          } 
                        }}
                      />
                      <input type="hidden" name="dateTo" value={toDate ? toDate.format('YYYY-MM-DD') : ''} />
                    </>
                  ) : (
                    <div style={{ height: '48px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '10px' }} />
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button type="submit" className="primary" style={{ flex: 1, padding: '0.8rem', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>Consultar</button>
                  <Link href="/relatorio" style={{ flex: 1 }}>
                    <button type="button" onClick={() => setShowFilters(false)} style={{ width: '100%', padding: '0.8rem', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>Limpar</button>
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
