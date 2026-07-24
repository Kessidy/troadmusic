import { getTenants, getPendingUsers } from '@/app/actions/backoffice';
import BackofficeClient from './BackofficeClient';

export default async function BackofficePage() {
  const tenants = await getTenants();
  const pendingUsers = await getPendingUsers();

  return <BackofficeClient tenants={tenants} pendingUsers={pendingUsers} />;
}
