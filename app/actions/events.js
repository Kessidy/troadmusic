'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getConfig } from './config';
import { sendScheduleNotificationEmail } from '@/lib/mail';
import { sendTelegramMessage, formatTelegramEventMessage } from '@/lib/telegram';

async function getTenantId() {
  const session = await auth();
  return session?.user?.tenantId || null;
}

export async function createEvent(formData) {
  const tenantId = await getTenantId();
  const name = formData.get('name');
  const address = formData.get('address');
  const eventDateValue = formData.get('eventDate');
  const musicianIds = formData.getAll('musicians');
  let songIds = formData.getAll('songs');
  const departmentId = formData.get('departmentId') || null;
  const randomizeRepertoire = formData.get('randomizeRepertoire') === 'true';
  const recurrenceDays = parseInt(formData.get('recurrenceDays') || '0');
  const recurrenceEndValue = formData.get('recurrenceEnd');

  const parsedDate = eventDateValue ? new Date(eventDateValue) : null;
  const eventDate = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : null;

  const sendNotifications = formData.get('sendNotifications') === 'true' || formData.get('sendNotifications') === 'on';
  const createdEvents = [];

  try {
    const config = await getConfig();
    const repDays = config?.repertoireLoopDays || 15;

    if (randomizeRepertoire && eventDate) {
      const allSongs = await prisma.song.findMany({ where: { tenantId } });
      const cutoffDate = new Date(eventDate);
      cutoffDate.setDate(cutoffDate.getDate() - repDays);
      const recentEvents = await prisma.event.findMany({
        where: { tenantId, eventDate: { gte: cutoffDate, lte: eventDate } },
        include: { songs: true },
      });
      const playedSongIds = new Set();
      recentEvents.forEach(e => e.songs.forEach(s => playedSongIds.add(s.id)));
      const availableSongs = allSongs.filter(s => !playedSongIds.has(s.id)).sort(() => 0.5 - Math.random());
      let selectedSongs = availableSongs.slice(0, 5);
      if (selectedSongs.length < 5) {
        const needed = 5 - selectedSongs.length;
        const playedSongs = allSongs.filter(s => playedSongIds.has(s.id)).sort(() => 0.5 - Math.random());
        selectedSongs = [...selectedSongs, ...playedSongs.slice(0, needed)];
      }
      songIds = selectedSongs.map(s => s.id);
    }

    const mainEvent = await prisma.event.create({
      data: {
        tenantId, name, address, eventDate, status: 'ativo', departmentId,
        musicianAssignments: {
          create: musicianIds.map(mId => ({ musicianId: mId, roleId: formData.get(`role_for_${mId}`) || null })),
        },
        songs: { connect: songIds.map(id => ({ id })) },
      },
    });
    createdEvents.push(mainEvent);

    if (recurrenceDays > 0 && eventDate && recurrenceEndValue) {
      const endDate = new Date(recurrenceEndValue);
      if (!isNaN(endDate.getTime())) {
        let currentDate = new Date(eventDate);
        currentDate.setDate(currentDate.getDate() + recurrenceDays);
        while (currentDate <= endDate) {
          let currentSongIds = [...songIds];
          if (randomizeRepertoire) {
            const loopCutoff = new Date(currentDate);
            loopCutoff.setDate(loopCutoff.getDate() - repDays);
            const recentEvents = await prisma.event.findMany({
              where: { tenantId, eventDate: { gte: loopCutoff, lte: currentDate } },
              include: { songs: true },
            });
            const playedSongIds = new Set();
            recentEvents.forEach(e => e.songs.forEach(s => playedSongIds.add(s.id)));
            const allSongs = await prisma.song.findMany({ where: { tenantId } });
            const availableSongs = allSongs.filter(s => !playedSongIds.has(s.id)).sort(() => 0.5 - Math.random());
            let selectedSongs = availableSongs.slice(0, 5);
            if (selectedSongs.length < 5) {
              const needed = 5 - selectedSongs.length;
              const playedSongs = allSongs.filter(s => playedSongIds.has(s.id)).sort(() => 0.5 - Math.random());
              selectedSongs = [...selectedSongs, ...playedSongs.slice(0, needed)];
            }
            currentSongIds = selectedSongs.map(s => s.id);
          }
          const recEvent = await prisma.event.create({
            data: {
              tenantId, name, address, eventDate: new Date(currentDate), status: 'ativo', departmentId,
              musicianAssignments: {
                create: musicianIds.map(mId => ({ musicianId: mId, roleId: formData.get(`role_for_${mId}`) || null })),
              },
              songs: { connect: currentSongIds.map(id => ({ id })) },
            },
          });
          createdEvents.push(recEvent);
          currentDate.setDate(currentDate.getDate() + recurrenceDays);
        }
      }
    }

    if (sendNotifications) {
      Promise.all(createdEvents.map(event => sendEventNotifications(event.id)))
        .catch(err => console.error('Error sending background notifications:', err));
    }
  } catch (error) {
    console.error('Failed to create event:', error);
    return { success: false, error: 'Failed to create event.' };
  }

  revalidatePath('/');
  revalidatePath('/dashboard');
  redirect('/');
}

export async function updateEvent(id, formData) {
  const eventDateValue = formData.get('eventDate');
  const musicianIds = formData.getAll('musicians');
  const songIds = formData.getAll('songs');
  const departmentId = formData.get('departmentId') || null;
  const sendNotifications = formData.get('sendNotifications') === 'true' || formData.get('sendNotifications') === 'on';
  const parsedDate = eventDateValue ? new Date(eventDateValue) : null;
  const eventDate = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : null;

  try {
    await prisma.event.update({
      where: { id },
      data: {
        eventDate, departmentId,
        musicianAssignments: {
          deleteMany: {},
          create: musicianIds.map(mId => ({ musicianId: mId, roleId: formData.get(`role_for_${mId}`) || null })),
        },
        songs: { set: songIds.map(sid => ({ id: sid })) },
      },
    });

    if (sendNotifications) {
      sendEventNotifications(id).catch(err => console.error('Error sending background notifications:', err));
    }
  } catch (error) {
    console.error('Failed to update event:', error);
    return { success: false, error: 'Failed to update event.' };
  }

  revalidatePath('/');
  revalidatePath('/dashboard');
  redirect('/');
}

export async function concludeEvent(id) {
  await prisma.event.update({ where: { id }, data: { status: 'concluido' } });
  revalidatePath('/');
  revalidatePath('/relatorio');
}

export async function autoCompleteExpiredEvents(tenantId) {
  const threshold = new Date(Date.now() - 4 * 60 * 60 * 1000); // Conclui apenas se tiver começado há mais de 4 horas
  await prisma.event.updateMany({
    where: { tenantId, status: 'ativo', eventDate: { lt: threshold } },
    data: { status: 'concluido' },
  });
}

export async function getActiveEvents() {
  const tenantId = await getTenantId();
  await autoCompleteExpiredEvents(tenantId);
  return await prisma.event.findMany({
    where: { tenantId, status: 'ativo' },
    include: {
      department: true,
      musicianAssignments: { include: { musician: { include: { departments: true } }, role: true } },
      songs: true,
    },
    orderBy: { eventDate: 'asc' },
  });
}

export async function getEvents() {
  const tenantId = await getTenantId();
  await autoCompleteExpiredEvents(tenantId);
  return await prisma.event.findMany({
    where: { tenantId },
    include: {
      department: true,
      musicianAssignments: { include: { musician: { include: { departments: true } }, role: true } },
      songs: true,
    },
    orderBy: { eventDate: 'asc' },
  });
}

export async function getAllEventsForReport({ status, dateFrom, dateTo, departmentId } = {}) {
  const tenantId = await getTenantId();
  const where = { tenantId };
  if (status) where.status = status;
  if (departmentId) where.departmentId = departmentId;
  if (dateFrom || dateTo) {
    where.eventDate = {};
    if (dateFrom) where.eventDate.gte = new Date(dateFrom);
    if (dateTo) where.eventDate.lte = new Date(dateTo);
  }
  return await prisma.event.findMany({
    where,
    include: {
      department: true,
      musicianAssignments: { include: { musician: { include: { departments: true } }, role: true } },
      songs: true,
    },
    orderBy: { eventDate: 'desc' },
  });
}

export async function getEvent(id) {
  return await prisma.event.findUnique({
    where: { id },
    include: {
      department: true,
      musicianAssignments: { include: { musician: { include: { departments: true } }, role: true } },
      songs: true,
    },
  });
}

export async function deleteEvent(id) {
  await prisma.event.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/dashboard');
}

export async function checkRepertoireViolations(songIds, targetDateStr) {
  const tenantId = await getTenantId();
  if (!songIds?.length || !targetDateStr) return { violations: [] };
  const targetDate = new Date(targetDateStr);
  if (isNaN(targetDate.getTime())) return { violations: [] };
  const config = await getConfig();
  const repDays = config?.repertoireLoopDays || 15;
  const cutoffDate = new Date(targetDate);
  cutoffDate.setDate(cutoffDate.getDate() - repDays);
  const recentEvents = await prisma.event.findMany({
    where: { tenantId, eventDate: { gte: cutoffDate, lte: targetDate } },
    include: { songs: true },
  });
  const recentSongTitles = new Map();
  recentEvents.forEach(e => e.songs.forEach(s => recentSongTitles.set(s.id, s.title)));
  const violations = songIds.filter(id => recentSongTitles.has(id)).map(id => recentSongTitles.get(id));
  return { violations };
}

export async function sendEventNotifications(eventId) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        musicianAssignments: {
          include: {
            musician: true,
            role: true,
          }
        },
        songs: true,
        department: true,
      }
    });

    if (!event) return { success: false, error: 'Evento não encontrado.' };

    let telegramsSent = 0;

    for (const assignment of event.musicianAssignments) {
      const m = assignment.musician;
      const roleName = assignment.role?.name || '';

      // Enviar Telegram
      if (m.telegramChatId) {
        const text = formatTelegramEventMessage({
          musicianName: m.firstName,
          eventName: event.name,
          eventDate: event.eventDate,
          eventAddress: event.address,
          roleName: roleName,
          songs: event.songs,
        });
        await sendTelegramMessage({
          chatId: m.telegramChatId,
          text,
        });
        telegramsSent++;
      }
    }

    return { success: true, telegramsSent };
  } catch (error) {
    console.error('Error sending event notifications:', error);
    return { success: false, error: error.message };
  }
}
