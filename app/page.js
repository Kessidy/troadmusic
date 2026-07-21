import { auth } from '@/auth';
import { getActiveEvents } from '@/app/actions/events';
import { getDepartments } from '@/app/actions/departments';
import { getSystemConfig } from '@/app/actions/system';
import AgendaList from './AgendaList';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();

  // If SuperAdmin, go straight to Backoffice
  if (session?.user?.role === 'SUPERADMIN') {
    redirect('/backoffice');
  }

  // === VISUALIZAÇÃO DO USUÁRIO AUTENTICADO (DASHBOARD) ===
  if (session) {
    const events = await getActiveEvents();
    const departments = await getDepartments();

    return (
      <div className="container" style={{ paddingBottom: '3rem' }}>
        <AgendaList initialEvents={events} departments={departments} />
      </div>
    );
  }

  // === VISÃO DO VISITANTE (LANDING PAGE PÚBLICA) ===
  const config = await getSystemConfig();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', color: 'var(--accent)', marginBottom: '1rem', fontWeight: '800', lineHeight: 1.2 }}>
            Servindo ao Reino através da Tecnologia
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--light-slate)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Fortalecendo o ministério de louvor com uma solução inteligente para organizar escalas, facilitar a comunicação e trazer mais unidade ao grupo. Porque quando há organização, sobra mais tempo para aquilo que realmente importa: adorar a Deus e ministrar vidas.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="#planos">
              <button className="primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '8px' }}>Ver Planos</button>
            </Link>
            <Link href="#solucoes">
              <button style={{ padding: '1rem 2rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.05)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer' }}>
                Nossas Soluções
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solucoes" style={{ background: 'var(--navy-lighter)', padding: '5rem 0' }}>
        <div className="container">
          <div className="section-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ color: 'var(--accent)', fontSize: '2rem' }}>Nossas Soluções</h2>
            <p style={{ color: 'var(--slate)' }}>Desenvolvemos ferramentas para cada necessidade do seu ministério.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--white)', marginBottom: '1rem' }}>Troadmusic</h3>
              <p style={{ color: 'var(--slate)' }}>O sistema definitivo para organização de agendas, escalas de músicos e repertório. Elimine a confusão e foque na adoração.</p>
            </div>
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--white)', marginBottom: '1rem' }}>Troad Security</h3>
              <p style={{ color: 'var(--slate)' }}>Segurança inteligente para templos e eventos. Monitoramento e controle de acesso com tecnologia de ponta.</p>
              <div style={{ marginTop: '1rem', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 'bold' }}>EM BREVE</div>
            </div>
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--white)', marginBottom: '1rem' }}>Koinonia Connect</h3>
              <p style={{ color: 'var(--slate)' }}>Plataforma de gestão de membresia e pequenos grupos. Fortaleça a comunhão e o acompanhamento pastoral.</p>
              <div style={{ marginTop: '1rem', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 'bold' }}>EM BREVE</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="section-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ color: 'var(--accent)', fontSize: '2rem' }}>Escolha o seu Plano</h2>
            <p style={{ color: 'var(--slate)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Um ministério afinado começa fora do altar. Invista na ferramenta que organiza suas escalas de &apos;Gênesis a Apocalipse&apos; e troque o estresse das faltas de última hora pelo foco total na adoração e no Reino.</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Basic Plan */}
            <div className="card" style={{ width: '100%', maxWidth: '350px', padding: '2.5rem', borderTop: '4px solid var(--accent)' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--white)', marginBottom: '0.5rem' }}>Basic</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent)', marginBottom: '0.5rem' }}>
                R$ {config.priceBasic.toFixed(2)}<span style={{ fontSize: '1rem', color: 'var(--slate)', fontWeight: '400' }}>/mês</span>
              </div>
              <p style={{ color: 'var(--slate)', marginBottom: '2rem', fontSize: '0.9rem' }}>Ideal para igrejas em crescimento e ministérios locais focados em organização.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', color: 'var(--light-slate)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Gestão de Agendas</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Escala de Músicos</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Repertório Centralizado</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Sem limite de usuários</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Limite de 06 Músicos</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Limite de 04 funções</li>
              </ul>
              <Link href="#contato">
                <button className="primary" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }}>Assinar Agora</button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="card" style={{ width: '100%', maxWidth: '350px', padding: '2.5rem', borderTop: '4px solid #f0a500' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--white)', marginBottom: '0.5rem' }}>Pro</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f0a500', marginBottom: '0.5rem' }}>
                R$ {config.pricePro.toFixed(2)}<span style={{ fontSize: '1rem', color: 'var(--slate)', fontWeight: '400' }}>/mês</span>
              </div>
              <p style={{ color: 'var(--slate)', marginBottom: '2rem', fontSize: '0.9rem' }}>Para grandes ministérios que precisam de suporte avançado e recursos completos.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', color: 'var(--light-slate)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#f0a500' }}>✓</span> Tudo do plano Basic</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#f0a500' }}>✓</span> Sem limite de usuários</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#f0a500' }}>✓</span> Limite de 10 departamentos</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#f0a500' }}>✓</span> Suporte Prioritário</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#f0a500' }}>✓</span> Relatórios Personalizados</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#f0a500' }}>✓</span> Gestão Multi-Templos</li>
              </ul>
              <Link href="#contato">
                <button style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(240,165,0,0.1)', border: '1px solid rgba(240,165,0,0.3)', color: '#f0a500', cursor: 'pointer', fontWeight: 'bold' }}>Falar com Consultor</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" style={{ background: 'var(--navy-lighter)', padding: '5rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>Vamos conversar?</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--light-slate)' }}>Estamos prontos para entender os desafios do seu ministério e propor a melhor solução tecnológica.</p>
              
              <div style={{ marginTop: '2.5rem' }}>
                <h3 style={{ color: 'var(--accent)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>E-mail</h3>
                <p style={{ color: 'var(--slate)', marginBottom: '1.5rem' }}>contato@troadtec.com.br</p>
                
                <h3 style={{ color: 'var(--accent)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Endereço</h3>
                <p style={{ color: 'var(--slate)' }}>TROADTEC Segurança e Tecnologia Ltda.<br />Santa Catarina, Brasil</p>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--white)' }}>Envie uma mensagem</h3>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Seu Nome completo" required style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--white)' }} />
                <input type="email" placeholder="Seu E-mail" required style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--white)' }} />
                <select required defaultValue="" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--white)' }}>
                  <option value="" disabled>Assunto de interesse</option>
                  <option value="troadmusic">Troadmusic (Planos & Preços)</option>
                  <option value="suporte">Dúvidas Técnicas</option>
                  <option value="outro">Outros Assuntos</option>
                </select>
                <textarea placeholder="Como podemos ajudar?" rows="5" required style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--white)', resize: 'vertical' }}></textarea>
                <button type="submit" className="primary" style={{ padding: '1rem', borderRadius: '6px', fontWeight: 'bold' }}>Enviar Mensagem</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
