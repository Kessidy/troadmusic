'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { autoCompleteExpiredEvents } from './events';

async function getTenantId() {
  const session = await auth();
  return session?.user?.tenantId || null;
}

export async function getDashboardData({ dateFrom, dateTo, status = 'ativo' } = {}) {
  const tenantId = await getTenantId();
  await autoCompleteExpiredEvents(tenantId);

  const eventWhere = { tenantId };
  if (status && status !== 'all') eventWhere.status = status;
  if (dateFrom || dateTo) {
    eventWhere.eventDate = {};
    if (dateFrom) eventWhere.eventDate.gte = new Date(dateFrom);
    if (dateTo) eventWhere.eventDate.lte = new Date(dateTo);
  }

  const [musicians, songs, events, departments] = await Promise.all([
    prisma.musician.findMany({
      where: { tenantId },
      include: { roles: true, departments: true },
      orderBy: { firstName: 'asc' },
    }),
    prisma.song.findMany({ where: { tenantId }, orderBy: { title: 'asc' } }),
    prisma.event.findMany({
      where: eventWhere,
      include: {
        department: true,
        musicianAssignments: { include: { musician: true, role: true } },
        songs: true,
      },
    }),
    prisma.department.findMany({ where: { tenantId } }),
  ]);

  const eventsPerMusician = musicians.map(m => ({
    id: m.id,
    name: `${m.firstName} ${m.lastName}`,
    role: m.roles?.map(r => r.name).join(', ') || 'N/A',
    eventCount: events.filter(e => e.musicianAssignments?.some(ma => ma.musicianId === m.id)).length,
  }));

  const eventsPerDepartment = departments.map(d => ({
    name: d.name,
    color: d.color,
    count: events.filter(e => e.departmentId === d.id).length,
  })).filter(d => d.count > 0);

  const eventsWithoutDept = events.filter(e => !e.departmentId).length;
  if (eventsWithoutDept > 0) {
    eventsPerDepartment.push({ name: 'Sem Departamento', color: '#8892b0', count: eventsWithoutDept });
  }

  const eventsPerSong = songs.map(s => ({
    name: s.title,
    count: events.filter(e => e.songs.some(es => es.id === s.id)).length,
  })).filter(s => s.count > 0).sort((a, b) => b.count - a.count);

  return {
    totalMusicians: musicians.length,
    totalSongs: songs.length,
    totalEvents: events.length,
    musicians,
    songs,
    eventsPerMusician,
    eventsPerDepartment,
    eventsPerSong,
  };
}
