import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/axios';

type Row = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  emailVerified: boolean;
  marketingOptInAt: string | null;
  createdAt: string;
  tenantName: string | null;
  tenantPlan: string | null;
  registrationCountry: string | null;
  declaredCountry: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminUsersNovedadesPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ role?: string } | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailFilter, setEmailFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const raw = localStorage.getItem('user');
    if (!token || !raw) {
      router.push('/login');
      return;
    }
    try {
      const u = JSON.parse(raw);
      setUser(u);
      if (u.role !== 'SUPER_ADMIN') router.replace('/admin');
    } catch {
      router.push('/login');
    }
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      };
      if (emailFilter.trim()) params.email = emailFilter.trim();
      const res = await api.get('/users/marketing-opt-in', { params });
      setRows(Array.isArray(res.data?.data) ? res.data.data : []);
      setTotal(typeof res.data?.total === 'number' ? res.data.total : 0);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'No se pudo cargar el listado');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, emailFilter]);

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') return;
    void load();
  }, [user, load]);

  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <AdminLayout>
        <div className="text-center p-5">
          <div className="spinner-border" role="status" />
        </div>
      </AdminLayout>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <AdminLayout>
      <div className="mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
          <h1 className="h3 mb-0">Suscriptores de novedades</h1>
          <Link href="/admin/users" className="btn btn-outline-secondary btn-sm">
            Volver a usuarios
          </Link>
        </div>
        <p className="text-muted mb-0">
          Usuarios que marcaron en el registro que quieren descubrir nuevas funciones, consejos y beneficios de
          MenuQR.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <form
            className="row g-2 align-items-end"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              void load();
            }}
          >
            <div className="col-md-6">
              <label className="form-label small mb-1" htmlFor="novedades-email">
                Filtrar por email
              </label>
              <input
                id="novedades-email"
                className="form-control form-control-sm"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                placeholder="ej. usuario@dominio.com"
              />
            </div>
            <div className="col-auto">
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                Buscar
              </button>
            </div>
            <div className="col-auto">
              <span className="small text-muted">Total: {total}</span>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-sm table-hover mb-0 align-middle">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nombre</th>
                <th>Plan</th>
                <th>Opt-in</th>
                <th>Registro</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <div className="spinner-border spinner-border-sm" role="status" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No hay usuarios suscritos a novedades
                    {emailFilter.trim() ? ' con ese filtro' : ''}.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <code className="small user-select-all">{r.email}</code>
                    </td>
                    <td>
                      {[r.firstName, r.lastName].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td>
                      <span className="badge bg-secondary">{r.tenantPlan || '—'}</span>
                    </td>
                    <td className="small">{formatDate(r.marketingOptInAt)}</td>
                    <td className="small">{formatDate(r.createdAt)}</td>
                    <td>
                      <span className={`badge ${r.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {r.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                      {!r.emailVerified ? (
                        <span className="badge bg-warning text-dark ms-1">Sin verificar</span>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 ? (
          <div className="card-footer d-flex justify-content-between align-items-center">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <span className="small text-muted">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </button>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
