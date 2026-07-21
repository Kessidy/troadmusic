'use client';

import React, { useState } from 'react';
import { updateSystemConfig, testTelegram } from '@/app/actions/system';
import Link from 'next/link';

export default function PricingClient({ initialConfig }) {
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testLog, setTestLog] = useState([]);

  async function handleSave(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    setLoading(true);
    setMsg('');
    const r = await updateSystemConfig(formData);
    if (r?.error) setMsg(r.error);
    else setMsg('✅ Configurações atualizadas com sucesso!');
    setLoading(false);
  }

  async function handleTestTelegram() {
    const form = document.querySelector('form');
    const formData = new FormData(form);
    
    setTestLoading(true);
    setMsg('');
    setTestLog(['🔍 Verificando Token do Telegram Bot...']);

    const addLog = (text, delay = 500) => new Promise(res => {
      setTimeout(() => {
        setTestLog(prev => [...prev, text]);
        res();
      }, delay);
    });

    await addLog('📡 Conectando ao Telegram API (getMe)...');
    
    const r = await testTelegram(formData);
    
    if (r.success) {
      await addLog(`✅ SUCESSO! Bot ativo: @${r.username}`);
      setMsg(`✅ Telegram Bot (@${r.username}) autenticado com sucesso!`);
    } else {
      await addLog(`❌ ERRO: ${r.error}`);
      setMsg('❌ Falha na autenticação do Telegram Bot.');
    }
    
    setTestLoading(false);
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/backoffice" style={{ color: 'var(--slate)', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
          ← Voltar
        </Link>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--white)' }}>⚙️ Configurações do Sistema</h1>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--accent)', marginBottom: '1.5rem' }}>💰 Configuração de Preços</h3>
        
        {msg && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: msg.includes('sucesso') ? 'rgba(100,255,218,0.1)' : 'rgba(255,77,77,0.1)', color: msg.includes('sucesso') ? 'var(--accent)' : '#ff6b6b', borderRadius: '8px', border: `1px solid ${msg.includes('sucesso') ? 'rgba(100,255,218,0.3)' : 'rgba(255,77,77,0.3)'}` }}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--slate)', marginBottom: '0.4rem', fontSize: '0.8rem' }}>Plano BASIC (R$)</label>
              <input type="number" name="priceBasic" step="0.01" defaultValue={initialConfig.priceBasic} required />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--slate)', marginBottom: '0.4rem', fontSize: '0.8rem' }}>Plano PRO (R$)</label>
              <input type="number" name="pricePro" step="0.01" defaultValue={initialConfig.pricePro} required />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0.5rem 0' }} />

          <h3 style={{ fontSize: '1rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>🤖 Configuração de Telegram Bot</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--slate)', marginBottom: '1rem' }}>Token de autenticação do Bot do Telegram para notificações de escala.</p>

          <div>
            <label style={{ display: 'block', color: 'var(--slate)', marginBottom: '0.4rem', fontSize: '0.8rem' }}>Token do Telegram Bot</label>
            <input name="telegramBotToken" defaultValue={initialConfig.telegramBotToken || ''} placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ" style={{ width: '100%' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              onClick={handleTestTelegram} 
              disabled={testLoading || loading} 
              style={{ padding: '1rem', fontSize: '1rem', borderRadius: '8px', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', cursor: 'pointer' }}
            >
              {testLoading ? 'Testando...' : '🤖 Testar Telegram'}
            </button>
            <button 
              type="submit" 
              disabled={loading || testLoading} 
              className="primary" 
              style={{ padding: '1rem', fontSize: '1rem', borderRadius: '8px' }}
            >
              {loading ? 'Salvando...' : '💾 Salvar Configurações'}
            </button>
          </div>

          {testLog.length > 0 && (
            <div style={{ 
              marginTop: '1.5rem', 
              background: '#0d1117', 
              borderRadius: '8px', 
              padding: '1rem', 
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
              fontSize: '0.8rem',
              color: '#e6edf3',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              maxHeight: '250px',
              overflowY: 'auto'
            }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', pb: '0.5rem', mb: '0.8rem', display: 'flex', justifyContent: 'space-between', color: 'var(--slate)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                <span>Console de Depuração</span>
                <span onClick={() => setTestLog([])} style={{ cursor: 'pointer', hover: { color: 'var(--accent)' } }}>Limpar</span>
              </div>
              {testLog.map((log, i) => (
                <div key={i} style={{ 
                  marginBottom: '6px', 
                  animation: 'fadeIn 0.2s ease forwards', 
                  opacity: 0,
                  color: log.includes('❌') ? '#ff7b72' : log.includes('✅') ? '#7ee787' : 'inherit'
                }}>
                  <span style={{ color: '#64ffda', marginRight: '8px' }}>$</span>
                  {log}
                </div>
              ))}
              {testLoading && (
                <div style={{ color: 'var(--accent)', animation: 'pulse 1s infinite', marginTop: '5px' }}>
                  <span style={{ color: '#64ffda', marginRight: '8px' }}>$</span>
                  Carregando...
                </div>
              )}
            </div>
          )}
        </form>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
