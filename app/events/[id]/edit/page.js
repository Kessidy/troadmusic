import { getMusicians } from '@/app/actions/musicians';
import { getSongs } from '@/app/actions/songs';
import { getDepartments } from '@/app/actions/departments';
import { getEvent, updateEvent } from '@/app/actions/events';
import EventEditForm from './EventEditForm';
import { notFound } from 'next/navigation';

export default async function EditEventPage({ params }) {
  const { id } = await params;
  const [event, musicians, songs, departments] = await Promise.all([
    getEvent(id),
    getMusicians(),
    getSongs(),
    getDepartments(),
  ]);

  if (!event) notFound();

  const updateAction = updateEvent.bind(null, id);

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Editar Evento</h1>
      <div className="card" style={{ padding: '2rem' }}>
        <EventEditForm
          event={event}
          musicians={musicians}
          songs={songs}
          departments={departments}
          updateEventAction={updateAction}
        />
      </div>
    </div>
  );
}
