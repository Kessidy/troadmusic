import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const update = await req.json();

    if (!update.message) {
      return NextResponse.json({ ok: true });
    }

    const { chat, text, contact } = update.message;
    const chatId = chat.id;

    // Fetch system configuration for bot token
    const systemConfig = await prisma.systemConfig.findUnique({ where: { id: 'global' } });
    if (!systemConfig?.telegramBotToken) {
      return NextResponse.json({ error: 'Telegram Bot Token not configured.' }, { status: 400 });
    }

    // Handle /start command
    if (text === '/start') {
      const responseText = `Olá! Seja bem-vindo ao <b>TroadMusic</b>. 🎸\n\nPara vincular sua conta e receber as notificações de suas escalas, por favor clique no botão abaixo para compartilhar seu contato.`;
      
      const payload = {
        chat_id: chatId,
        text: responseText,
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              {
                text: '📱 Compartilhar Contato',
                request_contact: true
              }
            ]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      };

      await fetch(`https://api.telegram.org/bot${systemConfig.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      return NextResponse.json({ ok: true });
    }

    // Handle contact sharing
    if (contact) {
      const rawPhone = contact.phone_number; // e.g. "5511999999999" or "+55 11 99999-9999"
      const normalizedContactPhone = rawPhone.replace(/\D/g, '');

      // Get all musicians in DB to find a phone match
      const musicians = await prisma.musician.findMany();
      
      // Find musician(s) whose phone matches normalizedContactPhone
      const matchedMusicians = musicians.filter(m => {
        const normDbPhone = m.phone.replace(/\D/g, '');
        // Compare stripping leading 55 if one of them has it and the other doesn't
        const p1 = normDbPhone.startsWith('55') ? normDbPhone.slice(2) : normDbPhone;
        const p2 = normalizedContactPhone.startsWith('55') ? normalizedContactPhone.slice(2) : normalizedContactPhone;
        return p1 === p2 || normDbPhone === normalizedContactPhone;
      });

      if (matchedMusicians.length > 0) {
        // Link all matched musicians to this telegram chat id
        for (const m of matchedMusicians) {
          await prisma.musician.update({
            where: { id: m.id },
            data: { telegramChatId: String(chatId) }
          });
        }

        const names = matchedMusicians.map(m => `${m.firstName} ${m.lastName}`).join(', ');
        const successText = `✅ <b>Sucesso!</b> Seu Telegram foi vinculado à conta de: <b>${names}</b>.\n\nA partir de agora, você receberá suas notificações de escala e repertório diretamente por aqui! 🚀`;
        
        await fetch(`https://api.telegram.org/bot${systemConfig.telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: successText,
            parse_mode: 'HTML',
            reply_markup: { remove_keyboard: true }
          }),
        });
      } else {
        const failureText = `❌ <b>Músico não encontrado.</b>\n\nNão encontramos nenhum integrante cadastrado no TroadMusic com o número <b>${rawPhone}</b>.\n\nPor favor, peça ao administrador do seu ministério para atualizar o seu número de contato cadastrado nas configurações.`;
        
        await fetch(`https://api.telegram.org/bot${systemConfig.telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: failureText,
            parse_mode: 'HTML',
            reply_markup: { remove_keyboard: true }
          }),
        });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
