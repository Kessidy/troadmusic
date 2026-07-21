import Link from 'next/link';

export default function Home() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Servindo ao Reino através da Tecnologia</h1>
          <p>Potencializando o ministério e a obra de Deus com soluções inovadoras e integradas.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/">
              <button className="primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>Conhecer o Troadmusic</button>
            </Link>
            <Link href="#solucoes">
              <button style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>Nossas Soluções</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Solutions Section (Inspired by DB1 Group) */}
      <section id="solucoes" style={{ background: 'var(--navy-lighter)' }}>
        <div className="container">
          <div className="section-title">
            <h2 style={{ color: 'var(--accent)' }}>Nossas Soluções</h2>
            <p>Desenvolvemos ferramentas para cada necessidade do seu ministério.</p>
          </div>

          <div className="grid">
            {/* Featured Solution: Troadmusic */}
            <div className="card solution-card">
              <div className="solution-icon">📅</div>
              <h3>Troadmusic</h3>
              <p>O sistema definitivo para organização de agendas, escalas de músicos e repertório. Elimine a confusão e foque no que realmente importa: a adoração.</p>
              <Link href="/" style={{ marginTop: '1.5rem', display: 'inline-block', fontWeight: 'bold' }}>
                Ver Detalhes →
              </Link>
            </div>

            {/* Other Solution ideas */}
            <div className="card solution-card">
              <div className="solution-icon">🛡️</div>
              <h3>Troad Security</h3>
              <p>Segurança inteligente para templos e eventos. Monitoramento e controle de acesso com tecnologia de ponta para a proteção do povo de Deus.</p>
              <span style={{ marginTop: '1.5rem', opacity: 0.5, fontSize: '0.8rem' }}>EM BREVE</span>
            </div>

            <div className="card solution-card">
              <div className="solution-icon">🤝</div>
              <h3>Koinonia Connect</h3>
              <p>Plataforma de gestão de membresia e pequenos grupos. Fortaleça a comunhão e o acompanhamento pastoral de forma digital e eficiente.</p>
              <span style={{ marginTop: '1.5rem', opacity: 0.5, fontSize: '0.8rem' }}>EM BREVE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Vamos conversar?</h2>
              <p style={{ fontSize: '1.1rem' }}>Estamos prontos para entender os desafios do seu ministério e propor a melhor solução tecnológica.</p>
              
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ color: 'var(--accent)' }}>Email</h3>
                <p>contato@troadtec.com.br</p>
                
                <h3 style={{ color: 'var(--accent)' }}>Endereço</h3>
                <p>TROADTEC Segurança e Tecnologia Ltda.<br />Sua Localidade, Brasil</p>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>Envie uma mensagem</h3>
              <form>
                <input type="text" placeholder="Seu Nome" required />
                <input type="email" placeholder="Seu E-mail" required />
                <select required defaultValue="">
                  <option value="" disabled>Assunto de interesse</option>
                  <option value="troadmusic">Troadmusic (Agenda)</option>
                  <option value="security">Troad Security</option>
                  <option value="outro">Outros Assuntos</option>
                </select>
                <textarea placeholder="Como podemos ajudar?" rows="5" style={{ background: 'var(--navy-lighter)', border: '1px solid var(--navy-lightest)', borderRadius: '8px', color: 'var(--white)', padding: '0.8rem' }}></textarea>
                <button type="submit" className="primary">Enviar Mensagem</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
