import { getSongs, createSong, deleteSong } from '@/app/actions/songs';
import Link from 'next/link';

export default async function SongsPage() {
  const songs = await getSongs();

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Cadastro de Repertório</h1>
      
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ marginBottom: '1.2rem', fontSize: '1.2rem', color: 'var(--light-slate)' }}>Nova Música</h2>
        <form action={createSong} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--slate)', display: 'block', marginBottom: '0.4rem' }}>Título da Música</label>
            <input type="text" name="title" placeholder="Ex: Hosana" required />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--slate)', display: 'block', marginBottom: '0.4rem' }}>Link do YouTube</label>
            <input type="url" name="youtubeLink" placeholder="https://youtube.com/..." required />
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
            <button type="submit" className="primary" style={{ width: '100%', padding: '0.8rem' }}>Salvar no Repertório</button>
          </div>
        </form>
      </div>

      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--light-slate)' }}>Músicas Cadastradas</h2>
      <div className="grid">
        {songs.map((s) => (
          <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent)' }}>{s.title}</h3>
            <div style={{ marginTop: 'auto', paddingTop: '1.2rem', display: 'flex', gap: '0.8rem' }}>
              <a href={s.youtubeLink} target="_blank" rel="noopener noreferrer" style={{ flex: 1 }}>
                <button type="button" style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}>Abrir no YouTube</button>
              </a>
              <form action={deleteSong.bind(null, s.id)} style={{ flex: 1 }}>
                <button type="submit" style={{ width: '100%', borderColor: '#ff4d4d', color: '#ff4d4d', padding: '0.5rem', fontSize: '0.8rem' }}>Excluir</button>
              </form>
            </div>
          </div>
        ))}
        {songs.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--slate)', padding: '2rem' }}>Nenhum item no repertório cadastrado.</p>}
      </div>
    </div>
  );
}
