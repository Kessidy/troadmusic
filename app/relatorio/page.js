import { getAllEventsForReport } from '@/app/actions/events';
import { getDepartments } from '@/app/actions/departments';
import Link from 'next/link';
import ReportFilters from './ReportFilters';

export default async function RelatorioPage({ searchParams }) {
  const params = await searchParams;
  const statusFilter = params?.status || '';
  const dateFrom = params?.dateFrom || '';
  const dateTo = params?.dateTo || '';
  const departmentId = params?.departmentId || '';

  const events = await getAllEventsForReport({
    status: statusFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    departmentId: departmentId || undefined,
  });

  const departments = await getDepartments();

  return (
    <div className="container relatorio-container">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Relatório de Eventos</h1>
          <p style={{ color: 'var(--slate)' }}>Consulta detalhada de todos os eventos agendados e concluídos.</p>
        </div>
        <Link href="/" className="desktop-only-flex">
          <button style={{ fontSize: '0.9rem' }}>← Voltar para Agenda</button>
        </Link>
      </div>

      {/* Filters Component */}
      <ReportFilters 
        statusFilter={statusFilter} 
        dateFrom={dateFrom} 
        dateTo={dateTo} 
        departmentId={departmentId}
        departments={departments}
      />

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {events.map((event) => (
          <div key={event.id} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--white)', marginBottom: '0.3rem' }}>{event.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--slate)', margin: 0 }}>📍 {event.address}</p>
                  {event.department && (
                    <div style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: `${event.department.color}15`, 
                      border: `1px solid ${event.department.color}`,
                      color: event.department.color,
                      padding: '0.1rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.6rem',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: event.department.color }}></span>
                      {event.department.name}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: 'max-content' }}>
                <span style={{ 
                  display: 'inline-block',
                  padding: '0.3rem 0.8rem', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem', 
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  background: event.status === 'ativo' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(100, 255, 218, 0.1)',
                  color: event.status === 'ativo' ? '#ffc107' : '#64ffda',
                  border: `1px solid ${event.status === 'ativo' ? '#ffc107' : '#64ffda'}`
                }}>
                  {event.status === 'ativo' ? '🟡 Ativo' : '✅ Concluído'}
                </span>
                <p style={{ marginTop: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--white)' }}>
                  {event.eventDate ? new Date(event.eventDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Sem data'}
                </p>
                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  {event.eventDate ? new Date(event.eventDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              {/* Musicians Section */}
              <div>
                <h3 style={{ fontSize: '1rem', color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🎵 Músicos Escalados
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {event.musicianAssignments?.map(ma => (
                    <div key={ma.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(0,0,0,0.15)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.9rem' }}>{ma.musician.firstName} {ma.musician.lastName}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--slate)', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                       {ma.role?.name || 'N/A'}
                      </span>
                    </div>
                  ))}
                  {(!event.musicianAssignments || event.musicianAssignments.length === 0) && <p style={{ color: 'var(--slate)', fontSize: '0.9rem' }}>Nenhum músico escalado.</p>}
                </div>
              </div>

              {/* Repertoire Section */}
              <div>
                <h3 style={{ fontSize: '1rem', color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🎶 Repertório Selecionado
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {event.songs.map(s => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(0,0,0,0.15)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.9rem' }}>{s.title}</span>
                      <a href={s.youtubeLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#ff4444' }}>
                        ▶ YouTube
                      </a>
                    </div>
                  ))}
                  {event.songs.length === 0 && <p style={{ color: 'var(--slate)', fontSize: '0.9rem' }}>Nenhum repertório definido.</p>}
                </div>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--slate)' }}>Nenhum evento encontrado com os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
