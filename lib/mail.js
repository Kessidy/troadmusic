import nodemailer from 'nodemailer';
import { prisma } from './prisma';

/**
 * Sends an enthusiastic invitation email.
 * Uses SMTP settings from SystemConfig if available, otherwise falls back to console log.
 */
export async function sendInvitationEmail({ to, firstName, ministryName, inviteUrl }) {
  const subject = `🚀 Venha fazer parte do ${ministryName} na TroadMusic!`;
  
  const bodyHtml = `
    <div style="font-family: sans-serif; color: #112240; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #0a192f; padding: 2rem; text-align: center;">
        <h1 style="color: #64ffda; margin: 0; letter-spacing: 2px;">TROADMUSIC</h1>
      </div>
      <div style="padding: 2rem; background: #ffffff;">
        <h2 style="color: #0a192f;">Olá, ${firstName}! 🔥</h2>
        <p>Estamos <strong>MUITO entusiasmados</strong> em convidar você para participar do sistema de escalas do <strong>${ministryName}</strong>!</p>
        <p>A TroadMusic chegou para facilitar nossa comunicação e organização, para que possamos focar no que realmente importa: a adoração!</p>
        
        <div style="text-align: center; margin: 2.5rem 0;">
          <a href="${inviteUrl}" style="background: #64ffda; color: #0a192f; padding: 1rem 2rem; border-radius: 30px; text-decoration: none; font-weight: 800; font-size: 1rem;">ACESSAR MINHA CONTA 🎸</a>
        </div>
        
        <p style="font-size: 0.9rem; color: #ff6b6b; text-align: center;"><strong>Atenção:</strong> Este link é único e expira em 7 dias.</p>
        
        <p>Estamos ansiosos para servir junto com você! 🙏🔥</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0;" />
        <p style="font-size: 0.85rem; color: #64748b; text-align: center;">Equipe ${ministryName} & TroadMusic</p>
      </div>
    </div>
  `;

  const bodyText = `
    Olá, ${firstName}!
    
    Estamos MUITO entusiasmados em convidar você para participar do sistema de escalas do ${ministryName}! 🎸✨
    
    Para acessar sua conta e ver suas próximas escalas, acesse: ${inviteUrl}
    
    Atenção: Este link é único e expira em 7 dias.
    
    Estamos ansiosos para servir junto com você! 🙏🔥
    
    Equipe ${ministryName} & TroadMusic
  `;

  try {
    // Fetch SMTP config from database
    const config = await prisma.systemConfig.findUnique({ where: { id: 'global' } });

    if (config?.smtpHost && config?.smtpUser && config?.smtpPass) {
      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort || 587,
        secure: config.smtpSecure || false,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"TroadMusic" <${config.smtpUser}>`,
        to,
        subject,
        text: bodyText,
        html: bodyHtml,
      });

      console.log(`✅ E-mail enviado via SMTP para: ${to}`);
      return { success: true, method: 'smtp' };
    } else {
      // Fallback to console log (enthusiastic mock)
      console.log('--- ENVIANDO E-MAIL (MOCK/SIMULADO) ---');
      console.log(`Para: ${to}`);
      console.log(`Assunto: ${subject}`);
      console.log(`Corpo: ${bodyText}`);
      console.log('--- CONFIGURAÇÃO DE SMTP NÃO ENCONTRADA ---');
      return { success: true, method: 'mock' };
    }
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    return { error: 'Falha no envio do e-mail.' };
  }
}

/**
 * Sends a schedule notification email to a musician assigned to an event.
 */
export async function sendScheduleNotificationEmail({ to, firstName, eventName, eventDate, eventAddress, roleName, songs }) {
  const dateStr = eventDate
    ? new Date(eventDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'A definir';
  const timeStr = eventDate
    ? new Date(eventDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '';

  const subject = `🎸 Você foi escalado! - ${eventName}`;

  const songsHtml = songs && songs.length > 0
    ? songs.map(s => `<li style="padding: 0.3rem 0;">${s.title}</li>`).join('')
    : '<li style="color: #64748b;">Nenhuma música definida</li>';

  const bodyHtml = `
    <div style="font-family: sans-serif; color: #112240; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #0a192f; padding: 2rem; text-align: center;">
        <h1 style="color: #64ffda; margin: 0; letter-spacing: 2px;">TROADMUSIC</h1>
        <p style="color: #8892b0; margin: 0.3rem 0 0 0; font-size: 0.85rem;">Notificação de Escala</p>
      </div>
      <div style="padding: 2rem; background: #ffffff;">
        <h2 style="color: #0a192f;">Olá, ${firstName}! 🎸</h2>
        <p>Você foi <strong>escalado(a)</strong> para o seguinte evento:</p>
        
        <div style="background: #f8fafc; border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0; border: 1px solid #e2e8f0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 0.4rem 0; color: #64748b; font-size: 0.85rem;">📌 Evento</td><td style="padding: 0.4rem 0; font-weight: 700;">${eventName}</td></tr>
            <tr><td style="padding: 0.4rem 0; color: #64748b; font-size: 0.85rem;">📅 Data</td><td style="padding: 0.4rem 0; font-weight: 700;">${dateStr}${timeStr ? ` às ${timeStr}` : ''}</td></tr>
            <tr><td style="padding: 0.4rem 0; color: #64748b; font-size: 0.85rem;">📍 Local</td><td style="padding: 0.4rem 0; font-weight: 700;">${eventAddress}</td></tr>
            ${roleName ? `<tr><td style="padding: 0.4rem 0; color: #64748b; font-size: 0.85rem;">🎸 Função</td><td style="padding: 0.4rem 0; font-weight: 700;">${roleName}</td></tr>` : ''}
          </table>
        </div>

        <h3 style="color: #0a192f; margin-bottom: 0.5rem;">🎶 Repertório:</h3>
        <ul style="margin: 0; padding-left: 1.2rem;">
          ${songsHtml}
        </ul>

        <p style="margin-top: 2rem;">Nos vemos lá! 🙏🔥</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0;" />
        <p style="font-size: 0.85rem; color: #64748b; text-align: center;">TroadMusic - Tecnologia para o Reino</p>
      </div>
    </div>
  `;

  const bodyText = `Olá, ${firstName}!\n\nVocê foi escalado(a) para:\n📌 ${eventName}\n📅 ${dateStr}${timeStr ? ` às ${timeStr}` : ''}\n📍 ${eventAddress}\n${roleName ? `🎸 ${roleName}\n` : ''}\nNos vemos lá! 🙏🔥`;

  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 'global' } });

    if (config?.smtpHost && config?.smtpUser && config?.smtpPass) {
      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort || 587,
        secure: config.smtpSecure || false,
        auth: { user: config.smtpUser, pass: config.smtpPass },
      });

      await transporter.sendMail({
        from: `"TroadMusic" <${config.smtpUser}>`,
        to,
        subject,
        text: bodyText,
        html: bodyHtml,
      });

      console.log(`✅ Notificação de escala enviada via SMTP para: ${to}`);
      return { success: true, method: 'smtp' };
    } else {
      console.log(`--- NOTIFICAÇÃO DE ESCALA (MOCK) para: ${to} ---`);
      console.log(`Assunto: ${subject}`);
      return { success: true, method: 'mock' };
    }
  } catch (error) {
    console.error(`❌ Erro ao enviar notificação para ${to}:`, error);
    return { error: 'Falha no envio do e-mail de notificação.' };
  }
}
