import { getMusicians } from '@/app/actions/musicians';
import { getRoles } from '@/app/actions/roles';
import { getDepartments } from '@/app/actions/departments';
import MusicianList from './MusicianList';
import MusicianForm from './MusicianForm';

export default async function MusiciansPage() {
  const musicians = await getMusicians();
  const roles = await getRoles();
  const departments = await getDepartments();

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Cadastro de Membros</h1>
      
      <MusicianForm roles={roles} departments={departments} />

      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--light-slate)' }}>Membros Cadastrados</h2>
      <MusicianList initialMusicians={musicians} roles={roles} departments={departments} />
    </div>
  );
}
