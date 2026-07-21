import { getMusicians } from '@/app/actions/musicians';
import { getSongs } from '@/app/actions/songs';
import { getDepartments } from '@/app/actions/departments';
import { createEvent, getEvent } from '@/app/actions/events';
import EventForm from './EventForm';

export default async function CreateEventPage({ searchParams }) {
  const musicians = await getMusicians();
  const songs = await getSongs();
  const departments = await getDepartments();
  
  const { duplicateId } = searchParams || {};
  let initialData = null;
  if (duplicateId) {
    initialData = await getEvent(duplicateId);
  }

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Agendar Novo Evento {initialData ? '- Cópia' : ''}</h1>
      
      <div className="card" style={{ padding: '2rem' }}>
        <EventForm 
          musicians={musicians} 
          songs={songs} 
          departments={departments}
          createEventAction={createEvent} 
          initialData={initialData}
        />
      </div>
    </div>
  );
}
