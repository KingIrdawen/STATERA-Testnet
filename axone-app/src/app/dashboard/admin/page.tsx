'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardAdminPage() {
  const router = useRouter();

  // Rediriger vers /admin
  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return null;
}

