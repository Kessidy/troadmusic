import { getRoles, updateRole, deleteRole } from '@/app/actions/roles';
import { getDepartments, updateDepartment, deleteDepartment } from '@/app/actions/departments';
import { getConfig, updateConfig } from '@/app/actions/config';
import { getMinistryUsers } from '@/app/actions/users';
import { auth } from '@/auth';
import Link from 'next/link';
import DepartmentForm from './DepartmentForm';
import EditableItem from './EditableItem';
import UserManagement from './UserManagement';

const COLORS = [
  '#64ffda', '#ff4d4d', '#4d79ff', '#ffcc00', '#ff8000',
  '#cc33ff', '#33cc33', '#ff3399', '#00d9ff', '#a8b2d1',
];

export default async function ConfigPage() {
  const session = await auth();
  const roles = await getRoles();
  const departments = await getDepartments();
  const config = await getConfig();
  const ministryUsers = await getMinistryUsers();

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Configurações</h1>

      {/* User Management Section */}
      <UserManagement 
        initialUsers={ministryUsers} 
        currentUserId={session?.user?.id} 
      />

      {/* General Settings */}
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--light-slate)' }}>⚙️ Gerais</h2>
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <form action={updateConfig} style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--slate)', marginBottom: '0.4rem', fontWeight: 'bold' }}>
              Dias para repetição de repertório
            </label>
            <input 
              type="number" 
              name="repertoireLoopDays" 
              defaultValue={config?.repertoireLoopDays || 15}
              min="0"
              required
              style={{ width: '100%' }}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--slate)', marginTop: '0.5rem' }}>
              Número de dias em que as músicas não deverão ser repetidas nos eventos.
            </p>
          </div>
          <button type="submit" className="primary" style={{ padding: '0.8rem 1.5rem', alignSelf: 'center', marginTop: '1.4rem' }}>
            Salvar Configurações
          </button>
        </form>
      </div>

      {/* Reports Button */}
      <div className="card" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>📋 Relatório de Eventos</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate)' }}>
            Consulte todos os eventos com músicos, repertório e status.
          </p>
        </div>
        <Link href="/relatorio">
          <button className="primary" style={{ padding: '0.7rem 1.5rem', whiteSpace: 'nowrap' }}>
            Ver Relatório →
          </button>
        </Link>
      </div>

      {/* Departments Form (Client Component) */}
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--light-slate)' }}>🏢 Categorias de Departamentos</h2>
      <DepartmentForm />

      <div className="grid" style={{ marginBottom: '3rem' }}>
        {departments.map((d) => (
          <EditableItem 
            key={d.id} 
            item={d} 
            colors={COLORS}
            onSave={updateDepartment}
            onDelete={deleteDepartment}
          />
        ))}
        {departments.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <p style={{ color: 'var(--slate)' }}>Nenhuma categoria cadastrada ainda.</p>
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '3rem' }} />

      {/* Role Management (Renamed to Instrumentos) */}
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--light-slate)' }}>🎸 Gerenciar Instrumentos</h2>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--slate)' }}>
          Cadastre instrumentos ou funções (ex: Bateria, Voz, Guitarra).
        </p>
        <form action={async (formData) => {
          'use server';
          const { createRole } = await import('@/app/actions/roles');
          await createRole(formData);
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              name="name" 
              placeholder="Ex: Teclado" 
              required 
              style={{ flex: 1 }}
            />
            <button type="submit" className="primary">Adicionar Instrumento</button>
          </div>
        </form>
      </div>

      <div className="grid" style={{ paddingBottom: '3rem' }}>
        {roles.map((r) => (
          <EditableItem 
            key={r.id} 
            item={r} 
            onSave={updateRole}
            onDelete={deleteRole}
          />
        ))}
        {roles.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <p style={{ color: 'var(--slate)' }}>Nenhum instrumento cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
