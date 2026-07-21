export default function LicencaExpiradaPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⏳</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f0a500', marginBottom: '1rem' }}>Licença Expirada</h1>
        <p style={{ color: 'var(--slate)', lineHeight: '1.7', marginBottom: '2rem' }}>
          A licença do seu ministério <strong style={{ color: '#f0a500' }}>expirou</strong>. Entre em contato com o suporte para renovar e recuperar o acesso ao sistema.
        </p>
        <div style={{ background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.2)', borderRadius: '10px', padding: '1.2rem' }}>
          <p style={{ color: 'var(--light-slate)', fontSize: '0.9rem' }}>📧 suporte@troadmusic.com</p>
        </div>
      </div>
    </div>
  );
}
