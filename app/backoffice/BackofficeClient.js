'use client';

import React, { useState } from 'react';
import {
  createTenant, updateLicense, blockUser, unblockUser, updateTenantStatus,
  setUserRole, adminResetPassword, createUserForTenant, assignUserToTenant, deleteTenant,
  deleteUser
} from '@/app/actions/backoffice';

const STATUS_COLORS = { active: '#64ffda', suspended: '#ff4d4d', expired: '#f0a500' };
const STATUS_LABELS = { active: '✅ Ativo', suspended: '🔴 Suspenso', expired: '⚠️ Expirado' };

const isPast = (dt) => new Date(dt) < new Date();

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatDateTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('pt-BR');
}

function TenantPanel({ tenant, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [editLicense, setEditLicense] = useState(false);
  const [msg, setMsg] = useState('');
  const lic = tenant.license;
  const licStatus = lic ? (lic.status === 'active' && isPast(lic.expiresAt) ? 'expired' : lic.status) : 'none';

  return (
    <div style={{ marginBottom: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
      {/* Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 100px 110px 110px 100px 110px', gap: '0.8rem', alignItems: 'center', padding: '1.2rem 1.5rem' }}>
        <div>
          <div style={{ fontWeight: '700', color: 'var(--white)' }}>{tenant.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate)', marginTop: '0.2rem' }}>/{tenant.slug} · {tenant.users.length} usuário(s)</div>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--light-slate)', fontWeight: '600' }}>{lic?.plan?.toUpperCase() || '—'}</div>
        <div style={{ fontSize: '0.8rem', color: STATUS_COLORS[licStatus] || 'var(--slate)' }}>{STATUS_LABELS[licStatus] || '—'}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--light-slate)' }}>{formatDate(lic?.expiresAt)}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--light-slate)' }}>{formatDate(tenant.createdAt)}</div>
        
        <button 
          onClick={async () => {
            const newStatus = licStatus === 'active' ? 'suspended' : 'active';
            await updateTenantStatus(tenant.id, newStatus);
            setMsg(`Ministério ${newStatus === 'active' ? 'ativado' : 'bloqueado'} com sucesso!`);
          }}
          style={{ 
            padding: '0.5rem 0.5rem', 
            background: licStatus === 'active' ? 'rgba(255,77,77,0.1)' : 'rgba(100,255,218,0.1)', 
            border: `1px solid ${licStatus === 'active' ? 'rgba(255,77,77,0.2)' : 'rgba(100,255,218,0.2)'}`, 
            borderRadius: '6px', 
            color: licStatus === 'active' ? '#ff6b6b' : 'var(--accent)', 
            cursor: 'pointer', 
            fontSize: '0.75rem', 
            fontWeight: '600' 
          }}
        >
          {licStatus === 'active' ? '🚫 Bloquear' : '⚡ Ativar'}
        </button>

        <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '0.5rem 0.5rem', background: expanded ? 'rgba(100,255,218,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(100,255,218,0.2)', borderRadius: '6px', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
          {expanded ? 'Fechar' : '🔍 Configurar'}
        </button>
      </div>

      {/* Expanded Panel */}
      {expanded && (
        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)' }}>
          {msg && <div style={{ marginBottom: '1rem', padding: '0.7rem', background: 'rgba(100,255,218,0.1)', borderRadius: '6px', color: 'var(--accent)', fontSize: '0.8rem' }}>{msg}</div>}

          {/* License Edit */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--light-slate)' }}>🔑 Licença</h3>
              <button onClick={() => setEditLicense(!editLicense)} style={{ fontSize: '0.75rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--slate)', padding: '0.3rem 0.6rem', cursor: 'pointer' }}>
                {editLicense ? 'Cancelar' : 'Editar'}
              </button>
            </div>
            {editLicense && lic && (
              <form action={async (fd) => { fd.append('licenseId', lic.id); const r = await updateLicense(fd); if (!r?.error) { setMsg('Licença atualizada!'); setEditLicense(false); } }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--slate)', display: 'block', marginBottom: '0.3rem' }}>Plano</label>
                  <select name="plan" defaultValue={lic.plan} style={{ width: '100%', fontSize: '0.85rem' }}>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--slate)', display: 'block', marginBottom: '0.3rem' }}>Status</label>
                  <select name="status" defaultValue={lic.status} style={{ width: '100%', fontSize: '0.85rem' }}>
                    <option value="active">Ativo</option>
                    <option value="suspended">Suspenso</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--slate)', display: 'block', marginBottom: '0.3rem' }}>Expira em</label>
                  <input type="date" name="expiresAt" defaultValue={lic.expiresAt?.toISOString?.().split('T')[0] || ''} style={{ width: '100%', fontSize: '0.85rem' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" className="primary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}>Salvar</button>
                </div>
              </form>
            )}
          </div>

          {/* Users Table */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--light-slate)' }}>👥 Usuários</h3>
              <button onClick={() => setAddingUser(!addingUser)} style={{ fontSize: '0.75rem', background: 'rgba(100,255,218,0.1)', border: '1px solid rgba(100,255,218,0.2)', borderRadius: '4px', color: 'var(--accent)', padding: '0.3rem 0.8rem', cursor: 'pointer' }}>
                {addingUser ? 'Cancelar' : '+ Criar Usuário'}
              </button>
            </div>

            {addingUser && (
              <form action={async (fd) => { fd.append('tenantId', tenant.id); const r = await createUserForTenant(fd); if (!r?.error) { setMsg('Usuário criado! Senha padrão: Troadmusic@123'); setAddingUser(false); } else { setMsg(r.error); } }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.8rem', marginBottom: '1rem', padding: '1rem', background: 'rgba(100,255,218,0.03)', borderRadius: '8px', border: '1px solid rgba(100,255,218,0.1)' }}>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--slate)', display: 'block', marginBottom: '0.3rem' }}>Nome</label><input name="name" required style={{ width: '100%', fontSize: '0.85rem' }} /></div>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--slate)', display: 'block', marginBottom: '0.3rem' }}>E-mail</label><input type="email" name="email" required style={{ width: '100%', fontSize: '0.85rem' }} /></div>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--slate)', display: 'block', marginBottom: '0.3rem' }}>Telefone</label><input name="phone" placeholder="(11) 99999-9999" style={{ width: '100%', fontSize: '0.85rem' }} /></div>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--slate)', display: 'block', marginBottom: '0.3rem' }}>Ministério</label><input name="ministry" placeholder="Nome da Igreja" style={{ width: '100%', fontSize: '0.85rem' }} /></div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--slate)', display: 'block', marginBottom: '0.3rem' }}>Role</label>
                  <select name="role" style={{ width: '100%', fontSize: '0.85rem' }}>
                    <option value="USER">Usuário</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" className="primary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}>Criar</button>
                </div>
              </form>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 80px 100px 140px 100px', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--slate)', padding: '0.4rem 0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span>E-mail</span><span>Telefone</span><span>Role</span><span>Status</span><span>Último Acesso</span><span>Ações</span>
            </div>

            {tenant.users.map(u => (
              <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 80px 100px 140px 100px', gap: '0.5rem', alignItems: 'center', padding: '0.7rem 0.8rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--light-slate)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.email}>{u.email}</span>
                <span style={{ color: 'var(--slate)' }}>{u.phone || '—'}</span>
                <span style={{ color: u.role === 'ADMIN' ? 'var(--accent)' : 'var(--slate)' }}>{u.role}</span>
                <span style={{ color: u.isBlocked ? '#ff4d4d' : '#64ffda' }}>{u.isBlocked ? '🔴 Bloq.' : '✅ Ativo'}</span>
                <span style={{ color: 'var(--slate)', fontSize: '0.75rem' }}>{formatDateTime(u.lastLoginAt)}</span>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button onClick={async () => { u.isBlocked ? await unblockUser(u.id) : await blockUser(u.id); setMsg(`Usuário ${u.isBlocked ? 'desbloqueado' : 'bloqueado'}.`); }}
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem', background: u.isBlocked ? 'rgba(100,255,218,0.1)' : 'rgba(255,77,77,0.1)', border: `1px solid ${u.isBlocked ? 'rgba(100,255,218,0.2)' : 'rgba(255,77,77,0.2)'}`, borderRadius: '4px', color: u.isBlocked ? 'var(--accent)' : '#ff6b6b', cursor: 'pointer' }}>
                    {u.isBlocked ? 'Ativar' : 'Bloquear'}
                  </button>
                  <button onClick={async () => { if (confirm(`Resetar senha de ${u.email} para Troadmusic@123?`)) { await adminResetPassword(u.id); setMsg('Senha resetada para Troadmusic@123'); } }}
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--slate)', cursor: 'pointer' }} title="Resetar Senha">
                    🔑
                  </button>
                  <button onClick={async () => { if (confirm(`Deseja EXCLUIR definitivamente o usuário ${u.email}?`)) { const r = await deleteUser(u.id); if(r?.error) setMsg(r.error); else setMsg('Usuário excluído!'); } }}
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem', background: 'rgba(255,77,77,0.05)', border: '1px solid rgba(255,77,77,0.1)', borderRadius: '4px', color: '#ff4d4d', cursor: 'pointer' }} title="Excluir Usuário">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {tenant.users.length === 0 && <p style={{ color: 'var(--slate)', fontSize: '0.8rem', padding: '0.8rem', textAlign: 'center' }}>Nenhum usuário neste tenant.</p>}
          </div>

          {/* Danger Zone */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,77,77,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontSize: '0.9rem', color: '#ff4d4d', marginBottom: '0.3rem' }}>⚠️ Zona de Risco</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate)', maxWidth: '400px' }}>
                  A exclusão do ministério apagará <strong>todos os eventos, músicos, repertório e configurações</strong> definitivamente. Os usuários não serão apagados, mas voltarão para o status de <i>Pendentes</i>.
                </p>
              </div>
              <form action={async (fd) => {
                if(window.confirm(`🚨 CUIDADO!\n\nTem certeza que deseja EXCLUIR o ministério "${tenant.name}"?\nEsta ação é irreversível e apagará todos os dados associados.`)) {
                  const r = await deleteTenant(fd);
                  if(r?.error) setMsg(r.error);
                }
              }}>
                <input type="hidden" name="tenantId" value={tenant.id} />
                <button type="submit" style={{ padding: '0.7rem 1.2rem', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '6px', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
                  🗑️ Excluir Ministério
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BackofficeClient({ tenants }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent)' }}>🧑‍💼 SuperAdmin Backoffice</h1>
          <p style={{ color: 'var(--slate)', fontSize: '0.85rem', marginTop: '0.3rem' }}>Gestão de tenants, licenças e usuários</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setShowDashboard(!showDashboard)} 
            style={{ padding: '0.7rem 1.2rem', background: showDashboard ? 'rgba(100,255,218,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${showDashboard ? 'rgba(100,255,218,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', color: showDashboard ? 'var(--accent)' : 'var(--slate)', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
          >
            {showDashboard ? 'Ocultar Dashboard' : '📊 Ver Dashboard'}
          </button>
          <button onClick={() => setCreateOpen(!createOpen)} className="primary" style={{ padding: '0.7rem 1.2rem', fontSize: '0.85rem' }}>
            + Novo Cliente
          </button>
        </div>
      </div>

      {msg && <div style={{ marginBottom: '1rem', padding: '0.8rem 1rem', background: 'rgba(100,255,218,0.08)', border: '1px solid rgba(100,255,218,0.2)', borderRadius: '8px', color: 'var(--accent)', fontSize: '0.85rem' }}>{msg}</div>}

      {/* Dashboard Section */}
      {showDashboard && (
        <div style={{ marginBottom: '2.5rem', animation: 'fadeIn 0.3s ease' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📊 Dashboard Geral
          </h2>

          {/* Top Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total de Clientes', value: tenants.length, color: 'var(--accent)' },
              { label: 'Clientes Ativos', value: tenants.filter(t => t.license?.status === 'active' && !isPast(t.license?.expiresAt)).length, color: '#64ffda' },
              { label: 'Clientes Suspensos', value: tenants.filter(t => t.license?.status === 'suspended').length, color: '#ff4d4d' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Users per ministry list */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--light-slate)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total de Usuários por Ministério
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {tenants.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--light-slate)', fontWeight: '600' }}>{t.name}</span>
                  <span style={{ fontSize: '1.1rem', color: 'var(--accent)', fontWeight: '700' }}>
                    {t.users.length} <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--slate)' }}>usuário(s)</span>
                  </span>
                </div>
              ))}
              {tenants.length === 0 && <span style={{ color: 'var(--slate)', fontSize: '0.85rem' }}>Nenhum ministério cadastrado.</span>}
            </div>
          </div>
        </div>
      )}

      {/* Create Tenant Form */}
      {createOpen && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--accent)', marginBottom: '1rem' }}>Novo Cliente / Tenant</h3>
          <form action={async (fd) => { const r = await createTenant(fd); if (!r?.error) { setMsg('Tenant criado!'); setCreateOpen(false); } else { setMsg(r.error); } }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div><label style={{ fontSize: '0.75rem', color: 'var(--slate)', display: 'block', marginBottom: '0.3rem' }}>Nome do Ministério</label><input name="name" placeholder="Igreja Louvor FC" required /></div>
            <div><label style={{ fontSize: '0.75rem', color: 'var(--slate)', display: 'block', marginBottom: '0.3rem' }}>Slug (URL)</label><input name="slug" placeholder="louvor-fc" required /></div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--slate)', display: 'block', marginBottom: '0.3rem' }}>Plano</label>
              <select name="plan"><option value="basic">Basic</option><option value="pro">Pro</option></select>
            </div>
            <div><label style={{ fontSize: '0.75rem', color: 'var(--slate)', display: 'block', marginBottom: '0.3rem' }}>Licença válida até</label><input type="date" name="expiresAt" required /></div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <button type="submit" className="primary" style={{ flex: 1, padding: '0.7rem' }}>Criar</button>
              <button type="button" onClick={() => setCreateOpen(false)} style={{ flex: 1, padding: '0.7rem', borderColor: '#ff4d4d', color: '#ff4d4d' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}


      {/* Tenant List View (Hidden when Dashboard is active) */}
      {!showDashboard && (
        <>
          {/* Filter Bar */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', opacity: 0.5 }}>🔍</span>
              <input
                type="text"
                placeholder="Filtrar por nome do ministério..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.2rem', fontSize: '0.9rem', background: 'rgba(255,255,255,0.04)' }}
              />
            </div>
            {search && (
              <button onClick={() => setSearch('')} style={{ padding: '0.5rem 1rem', background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '8px', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                ✕ Limpar
              </button>
            )}
            <div style={{ fontSize: '0.78rem', color: 'var(--slate)', whiteSpace: 'nowrap' }}>
              {search ? `${tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase())).length} resultado(s)` : `${tenants.length} cliente(s)`}
            </div>
          </div>

          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 100px 110px 110px 100px 110px', gap: '0.8rem', padding: '0.5rem 1.5rem', fontSize: '0.7rem', color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
            <span>Ministério</span><span>Plano</span><span>Status</span><span>Expiração</span><span>Criado</span><span>Ação</span><span></span>
          </div>

          {/* Tenant Rows */}
          {tenants
            .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
            .map(t => <TenantPanel key={t.id} tenant={t} />)
          }
          {tenants.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate)' }}>
              Nenhum cliente cadastrado. Clique em <strong>+ Novo Cliente</strong> para começar.
            </div>
          )}
          {tenants.length > 0 && search && tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate)' }}>
              Nenhum ministério encontrado para <strong style={{ color: 'var(--accent)' }}>&ldquo;{search}&rdquo;</strong>
            </div>
          )}
        </>
      )}
    </div>
  );
}
