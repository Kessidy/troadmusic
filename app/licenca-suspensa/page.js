export default function LicensaSuspensaPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔒</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ff6b6b', marginBottom: '1rem' }}>Acesso Suspenso</h1>
        <p style={{ color: 'var(--slate)', lineHeight: '1.7', marginBottom: '2rem' }}>
          A licença do seu ministério está <strong style={{ color: '#ff6b6b' }}>suspensa</strong>. Entre em contato com o suporte para reativar o acesso.
        </p>
        <div style={{ background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '10px', padding: '1.2rem' }}>
          <p style={{ color: 'var(--light-slate)', fontSize: '0.9rem' }}>📧 suporte@troadmusic.com</p>
        </div>
      </div>
    </div>
  );
}
