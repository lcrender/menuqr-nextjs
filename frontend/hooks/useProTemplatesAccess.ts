'use client';

import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { tenantPlanAllowsProTemplates } from '../lib/consume-template-after-auth';
import { hasProTemplatesAccessFromStoredUser } from '../lib/plan-access';

export function useProTemplatesAccess(): boolean {
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkStored = () => setHasAccess(hasProTemplatesAccessFromStoredUser());
    checkStored();

    const token = localStorage.getItem('accessToken');
    if (token) {
      api
        .get('/restaurants/dashboard-stats')
        .then((res) => {
          const plan = typeof res.data?.plan === 'string' ? res.data.plan : null;
          const allowed = tenantPlanAllowsProTemplates(plan);
          setHasAccess(allowed);
          if (allowed && plan) {
            try {
              const raw = localStorage.getItem('user');
              if (raw) {
                const user = JSON.parse(raw) as { tenant?: { plan?: string } | null };
                if (user?.tenant && user.tenant.plan !== plan) {
                  user.tenant.plan = plan;
                  localStorage.setItem('user', JSON.stringify(user));
                }
              }
            } catch {
              /* ignore */
            }
          }
        })
        .catch(() => {
          /* mantener valor de localStorage */
        });
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === null) checkStored();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return hasAccess;
}
