'use client';

import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import Link from 'next/link';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

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

const CHART_COLORS = [
  '#64ffda', '#00bcd4', '#4dd0e1', '#80deea',
  '#0097a7', '#26c6da', '#4fc3f7', '#29b6f6',
];

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { labels: { color: '#a8b2d1', font: { family: 'Outfit' } } },
    tooltip: {
      backgroundColor: '#112240',
      borderColor: '#64ffda',
      borderWidth: 1,
      titleColor: '#64ffda',
 bodyColor: '#e6f1ff',
    },
  },
  scales: {
    x: {
      ticks: { color: '#8892b0', font: { family: 'Outfit' } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
    y: {
      ticks: { color: '#8892b0', font: { family: 'Outfit' }, stepSize: 1 },
      grid: { color: 'rgba(255,255,255,0.05)' },
      beginAtZero: true,
    },
  },
};

const doughnutOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'right',
      labels: { color: '#a8b2d1', font: { family: 'Outfit' }, padding: 12, boxWidth: 14 },
    },
    tooltip: {
      backgroundColor: '#112240',
      borderColor: '#64ffda',
      borderWidth: 1,
      titleColor: '#64ffda',
      bodyColor: '#e6f1ff',
    },
  },
};

export default function DashboardCharts({ 
  totalMusicians, totalSongs, totalEvents, musicians, songs, eventsPerMusician, eventsPerDepartment, eventsPerSong,
  dateFrom, dateTo, status
}) {
  const [mounted, setMounted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState(dateFrom ? dayjs(dateFrom) : null);
  const [toDate, setToDate] = useState(dateTo ? dayjs(dateTo) : null);
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const barData = {
    labels: eventsPerMusician.map(m => m.name),
    datasets: [{
      label: 'Eventos no Período',
      data: eventsPerMusician.map(m => m.eventCount),
      backgroundColor: 'rgba(100, 255, 218, 0.3)',
      borderColor: '#64ffda',
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  const roleMap = {};
  musicians.forEach(m => {
    if (m.roles && m.roles.length > 0) {
      m.roles.forEach(r => {
        roleMap[r.name] = (roleMap[r.name] || 0) + 1;
      });
    } else {
      roleMap['Sem Função'] = (roleMap['Sem Função'] || 0) + 1;
    }
  });
  const doughnutData = {
    labels: Object.entries(roleMap).map(([role, count]) => `${role} (${count})`),
    datasets: [{
      data: Object.values(roleMap),
      backgroundColor: CHART_COLORS,
      borderColor: '#0a192f',
      borderWidth: 3,
    }],
  };

  const departmentDoughnutData = {
    labels: eventsPerDepartment?.map(d => `${d.name} (${d.count})`) || [],
    datasets: [{
      data: eventsPerDepartment?.map(d => d.count) || [],
      backgroundColor: eventsPerDepartment?.map(d => d.color) || [],
      borderColor: '#0a192f',
      borderWidth: 3,
    }],
  };

  const songDoughnutData = {
    labels: eventsPerSong?.slice(0, 15).map(s => `${s.name} (${s.count})`) || [], // Limit high numbers for UI safety
    datasets: [{
      data: eventsPerSong?.slice(0, 15).map(s => s.count) || [],
      backgroundColor: CHART_COLORS,
      borderColor: '#0a192f',
      borderWidth: 3,
    }],
  };

  const hasActiveFilters = status !== 'ativo' || dateFrom || dateTo;

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
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: '1.5rem', 
                alignItems: 'end'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--slate)', fontWeight: '600', marginLeft: '0.2rem' }}>📍 Status</label>
                  <select 
                    name="status" 
                    defaultValue={status} 
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
                    <option value="all" style={{ background: 'var(--navy-lighter)', color: 'var(--white)' }}>Todos os Eventos</option>
                    <option value="ativo" style={{ background: 'var(--navy-lighter)', color: 'var(--white)' }}>🟡 Somente Ativos</option>
                    <option value="concluido" style={{ background: 'var(--navy-lighter)', color: 'var(--white)' }}>✅ Somente Concluídos</option>
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
                  <button type="submit" className="primary" style={{ flex: 1, padding: '0.8rem', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>Aplicar</button>
                  <Link href="/dashboard" style={{ flex: 1 }}>
                    <button type="button" onClick={() => setShowFilters(false)} style={{ width: '100%', padding: '0.8rem', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>Limpar</button>
                  </Link>
                </div>
              </form>
            </div>
          )}

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {[
              { label: 'Músicos Cadastrados', value: totalMusicians, icon: '🎵' },
              { label: 'Músicas Cadastradas', value: totalSongs, icon: '🎶' },
              { label: `Eventos (${status === 'ativo' ? 'Ativos' : status === 'concluido' ? 'Concluídos' : 'Total'})`, value: totalEvents, icon: '📅' },
            ].map(kpi => (
              <div key={kpi.label} className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{kpi.icon}</div>
                <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--accent)', lineHeight: 1 }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--slate)', marginTop: '0.5rem' }}>{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--light-slate)' }}>
                📊 Participação em Eventos ({status === 'ativo' ? 'Ativos' : status === 'concluido' ? 'Concluídos' : 'Geral'})
              </h3>
              {eventsPerMusician.length > 0 && eventsPerMusician.some(m => m.eventCount > 0)
                ? <Bar data={barData} options={chartOptions} />
                : <p style={{ color: 'var(--slate)', textAlign: 'center', padding: '2rem' }}>Sem eventos encontrados para este filtro.</p>
              }
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--light-slate)' }}>
                🏢 Eventos por Departamento
              </h3>
              {eventsPerDepartment?.length > 0
                ? <Doughnut data={departmentDoughnutData} options={doughnutOptions} />
                : <p style={{ color: 'var(--slate)', textAlign: 'center', padding: '2rem' }}>Sem eventos encontrados.</p>
              }
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--light-slate)' }}>
                🎨 Músicos por Função
              </h3>
              {musicians.length > 0
                ? <Doughnut data={doughnutData} options={doughnutOptions} />
                : <p style={{ color: 'var(--slate)', textAlign: 'center', padding: '2rem' }}>Sem dados.</p>
              }
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--light-slate)' }}>
                🎧 Músicas Mais Tocadas
              </h3>
              {eventsPerSong?.length > 0
                ? <Doughnut data={songDoughnutData} options={doughnutOptions} />
                : <p style={{ color: 'var(--slate)', textAlign: 'center', padding: '2rem' }}>Sem eventos encontrados.</p>
              }
            </div>
          </div>

          {/* Lists Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {/* Musicians List */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--light-slate)' }}>
                🎵 Lista de Músicos
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
                {musicians.map((m, i) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', color: '#0a192f', flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: '0.9rem' }}>{m.firstName} {m.lastName}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent)', background: 'rgba(100,255,218,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', textAlign: 'right' }}>
                      {m.roles?.map(r => r.name).join(', ') || 'N/A'}
                    </span>
                  </div>
                ))}
                {musicians.length === 0 && <p style={{ color: 'var(--slate)', textAlign: 'center' }}>Nenhum músico cadastrado</p>}
              </div>
            </div>

            {/* Songs List */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--light-slate)' }}>
                🎶 Lista de Músicas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
                {songs.map((s, i) => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', color: '#0a192f', flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: '0.9rem' }}>{s.title}</span>
                    </div>
                    <a href={s.youtubeLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#ff4444', background: 'rgba(255,68,68,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      ▶ YouTube
                    </a>
                  </div>
                ))}
                {songs.length === 0 && <p style={{ color: 'var(--slate)', textAlign: 'center' }}>Nenhuma música cadastrada</p>}
              </div>
            </div>
          </div>
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
