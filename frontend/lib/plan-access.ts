/**
 * Misma heurística que en admin de plantillas: acceso a plantillas PRO del tenant.
 */
export function hasProTemplatesAccessFromStoredUser(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return false;
    const u = JSON.parse(raw) as { tenant?: { plan?: string } | null };
    const plan = (u?.tenant?.plan || '').toString().toLowerCase().replace(/[\s-]+/g, '_');
    return plan === 'pro' || plan === 'pro_team' || plan === 'premium';
  } catch {
    return false;
  }
}
