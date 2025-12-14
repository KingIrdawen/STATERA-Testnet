'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  // Rediriger vers /dashboard/strategy par défaut
  useEffect(() => {
    router.replace('/dashboard/strategy');
  }, [router]);

  return null;
}
