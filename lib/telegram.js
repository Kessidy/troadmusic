import { prisma } from './prisma';

/**
 * Send a Telegram message using the Bot API.
 * Requires the bot token from SystemConfig and the recipient's chat ID.
 */
export async function sendTelegramMessage({ chatId, text }) {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 'global' } });

    if (!config?.telegramBotToken) {
      console.log('⚠️ Telegram Bot Token não configurado. Mensagem não enviada.');
      return { success: false, reason: 'no_token' };
    }

    const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      console.error('❌ Erro Telegram:', data.description);
      return { success: false, error: data.description };
    }

    console.log(`✅ Telegram enviado para chat_id: ${chatId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao enviar Telegram:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Format an event notification for Telegram.
 */
export function formatTelegramEventMessage({ musicianName, eventName, eventDate, eventAddress, roleName, songs }) {
  const dateStr = eventDate
    ? new Date(eventDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'A definir';
  const timeStr = eventDate
    ? new Date(eventDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '';

  let msg = `🎵 <b>TroadMusic - Você foi escalado!</b>\n\n`;
  msg += `Olá, <b>${musicianName}</b>! 🔥\n\n`;
  msg += `📌 <b>Evento:</b> ${eventName}\n`;
  msg += `📅 <b>Data:</b> ${dateStr}${timeStr ? ` às ${timeStr}` : ''}\n`;
  msg += `📍 <b>Local:</b> ${eventAddress}\n`;

  if (roleName) {
    msg += `🎸 <b>Função:</b> ${roleName}\n`;
  }

  if (songs && songs.length > 0) {
    msg += `\n🎶 <b>Repertório:</b>\n`;
    songs.forEach(s => {
      msg += `  • ${s.title}\n`;
    });
  }

  msg += `\nAté lá! 🙏🔥`;
  return msg;
}

/**
 * Retrieve updates from the Telegram Bot API on demand.
 * This acts as a fallback for local environments without public webhooks.
 */
export async function syncTelegramUpdates() {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 'global' } });
    if (!config?.telegramBotToken) {
      return { success: false, reason: 'no_token' };
    }

    // Get updates from Telegram
    const getUpdatesRes = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/getUpdates?timeout=0`);
    const updatesData = await getUpdatesRes.json();

    if (!updatesData.ok || !updatesData.result || updatesData.result.length === 0) {
      return { success: true, processedCount: 0 };
    }

    let processedCount = 0;
    let maxUpdateId = 0;

    for (const update of updatesData.result) {
      if (update.update_id > maxUpdateId) {
        maxUpdateId = update.update_id;
      }

      if (!update.message) continue;

      const { chat, text, contact } = update.message;
      const chatId = chat.id;

      // Handle /start command
      if (text === '/start') {
        const responseText = `Olá! Seja bem-vindo ao <b>TroadMusic</b>. 🎸\n\nPara vincular sua conta e receber as notificações de suas escalas, por favor clique no botão abaixo para compartilhar seu contato.`;
        
        await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
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
          }),
        });
        processedCount++;
      }

      // Handle contact sharing
      if (contact) {
        const rawPhone = contact.phone_number;
        const normalizedContactPhone = rawPhone.replace(/\D/g, '');

        // Fetch all musicians to match phone number
        const musicians = await prisma.musician.findMany();
        const matchedMusicians = musicians.filter(m => {
          const normDbPhone = m.phone.replace(/\D/g, '');
          const p1 = normDbPhone.startsWith('55') ? normDbPhone.slice(2) : normDbPhone;
          const p2 = normalizedContactPhone.startsWith('55') ? normalizedContactPhone.slice(2) : normalizedContactPhone;
          return p1 === p2 || normDbPhone === normalizedContactPhone;
        });

        if (matchedMusicians.length > 0) {
          for (const m of matchedMusicians) {
            await prisma.musician.update({
              where: { id: m.id },
              data: { telegramChatId: String(chatId) }
            });
          }

          const names = matchedMusicians.map(m => `${m.firstName} ${m.lastName}`).join(', ');
          const successText = `✅ <b>Sucesso!</b> Seu Telegram foi vinculado à conta de: <b>${names}</b>.\n\nA partir de agora, você receberá suas escalas e repertório diretamente por aqui! 🚀`;

          await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
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

          await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
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
        processedCount++;
      }
    }

    // Confirm reading updates to Telegram by setting offset to maxUpdateId + 1
    if (maxUpdateId > 0) {
      await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/getUpdates?offset=${maxUpdateId + 1}`);
    }

    return { success: true, processedCount };
  } catch (error) {
    console.error('Error syncing Telegram updates:', error);
    return { success: false, error: error.message };
  }
}
