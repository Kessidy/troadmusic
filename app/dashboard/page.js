import { getDashboardData } from '@/app/actions/dashboard';
import DashboardCharts from './DashboardCharts';

export default async function DashboardPage({ searchParams }) {
  const params = await searchParams;
  const status = params?.status || 'ativo';
  const dateFrom = params?.dateFrom || '';
  const dateTo = params?.dateTo || '';

  const data = await getDashboardData({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    status,
  });

  return (
    <div className="container dashboard-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--slate)', marginTop: '0.3rem', fontSize: '0.95rem' }}>
          Visão geral do ministério Troadmusic ({status === 'all' ? 'Todos os Eventos' : status === 'ativo' ? 'Apenas Ativos' : 'Apenas Concluídos'})
        </p>
      </div>
      <DashboardCharts 
        {...data} 
        status={status}
        dateFrom={dateFrom} 
        dateTo={dateTo} 
      />
    </div>
  );
}
