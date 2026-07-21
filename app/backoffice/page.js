import { getTenants } from '@/app/actions/backoffice';
import BackofficeClient from './BackofficeClient';

export default async function BackofficePage() {
  const tenants = await getTenants();

  return <BackofficeClient tenants={tenants} />;
}
