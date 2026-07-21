'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';

export async function getSystemConfig() {
  let config = await prisma.systemConfig.findUnique({
    where: { id: 'global' }
  });

  if (!config) {
    config = await prisma.systemConfig.create({
      data: { id: 'global', priceBasic: 50.00, pricePro: 100.00 }
    });
  }

  return config;
}

export async function updateSystemConfig(formData) {
  try {
    const priceBasic = parseFloat(formData.get('priceBasic'));
    const pricePro = parseFloat(formData.get('pricePro'));
    
    // SMTP Fields
    const smtpHost = formData.get('smtpHost')?.trim();
    const smtpPort = parseInt(formData.get('smtpPort') || '587', 10);
    const smtpUser = formData.get('smtpUser')?.trim();
    const smtpPass = formData.get('smtpPass')?.trim();
    const smtpSecure = formData.get('smtpSecure') === 'on' || formData.get('smtpSecure') === 'true';

    // Telegram Token
    const telegramBotToken = formData.get('telegramBotToken')?.trim() || null;

    if (isNaN(priceBasic) || isNaN(pricePro)) {
      return { error: 'Valores inválidos para os preços.' };
    }

    await prisma.systemConfig.upsert({
      where: { id: 'global' },
      update: { 
        priceBasic, 
        pricePro,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
        smtpSecure,
        telegramBotToken
      },
      create: { 
        id: 'global', 
        priceBasic, 
        pricePro,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
        smtpSecure,
        telegramBotToken
      }
    });

    revalidatePath('/');
    revalidatePath('/backoffice');
    revalidatePath('/backoffice/pricing');
    return { success: true };
  } catch (error) {
    console.error('Error updating system config:', error);
    return { error: `Erro ao salvar configurações: ${error.message}` };
  }
}

export async function testTelegram(formData) {
  const session = await auth();
  if (session?.user?.role !== 'SUPERADMIN') {
    return { error: 'Não autorizado.' };
  }

  const token = formData.get('telegramBotToken')?.trim();
  if (!token) {
    return { error: 'Preencha o Token do Bot para testar.' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await res.json();
    if (!data.ok) {
      return { error: `Token inválido: ${data.description}` };
    }
    return { success: true, username: data.result.username };
  } catch (error) {
    return { error: `Erro de conexão: ${error.message}` };
  }
}



export async function testSmtp(formData) {
  // Check if current user is SUPERADMIN
  const session = await auth();
  if (session?.user?.role !== 'SUPERADMIN') {
    return { error: 'Não autorizado.' };
  }

  const smtpHost = formData.get('smtpHost')?.trim();
  const smtpPort = parseInt(formData.get('smtpPort') || '587', 10);
  const smtpUser = formData.get('smtpUser')?.trim();
  const smtpPass = formData.get('smtpPass')?.trim();
  const smtpSecure = formData.get('smtpSecure') === 'on' || formData.get('smtpSecure') === 'true';

  if (!smtpHost || !smtpUser || !smtpPass) {
    return { error: 'Preencha Host, Usuário e Senha para testar.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"TroadMusic Test" <${smtpUser}>`,
      to: smtpUser, // Send to self as test
      subject: '🧪 TroadMusic: Teste de Configuração SMTP',
      text: 'Este é um e-mail de teste para validar suas configurações de SMTP na TroadMusic. Se você recebeu isso, está tudo funcionando! 🔥',
      html: '<div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; color: #112240;"><h2>⚡ Teste Concluído!</h2><p>Seu servidor SMTP está configurado corretamente na <b>TroadMusic</b>.</p><p>Agora os convites serão enviados profissionalmente. 🔥</p></div>',
    });

    return { success: true };
  } catch (error) {
    console.error('SMTP Test Error:', error);
    return { 
      error: `Falha no teste: ${error.message}`,
      details: {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        address: error.address,
        port: error.port
      }
    };
  }
}

