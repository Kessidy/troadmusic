import { getSystemConfig } from '@/app/actions/system';
import PricingClient from './PricingClient';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function PricingConfigPage() {
  const session = await auth();
  if (session?.user?.role !== 'SUPERADMIN') {
    redirect('/');
  }

  const config = await getSystemConfig();

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <PricingClient initialConfig={config} />
    </div>
  );
}
