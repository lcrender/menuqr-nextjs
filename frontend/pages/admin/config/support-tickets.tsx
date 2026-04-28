import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/axios';

type TicketRow = {
  id: string;
  ticketNumber: number;
  subject: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  updatedAt: string;
  lastReplyAt: string | null;
  attachmentCount?: number;
  user: { id: string; email: string; firstName: string | null; lastName: string | null; role: string };
};

const STATUS_LABEL: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En progreso',
  closed: 'Cerrado',
};

export default function AdminSupportTicketsPage() {
  const [items, setItems] = useState<TicketRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async (
    st: string = status,
    em: string = userEmail,
    fr: string = from,
    t: string = to,
  ) => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { limit: '100', offset: '0' };
      if (st) params.status = st;
      if (em.trim()) params.userEmail = em.trim();
      if (fr) params.from = fr;
      if (t) params.to = t;
      const res = await api.get('/support-tickets/admin', { params });
      setItems(Array.isArray(res.data?.items) ? res.data.items : []);
      setTotal(typeof res.data?.total === 'number' ? res.data.total : 0);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' ') : msg || 'No se pudo cargar los tickets.');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load('', '', '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <h1 className="h4 mb-3">Tickets de soporte</h1>
        <p className="text-muted small mb-4">
          Gestioná reportes de usuarios: abrí un ticket para ver el hilo, datos de cuenta y suscripción, y respondé
          desde el detalle.
        </p>

        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-2 align-items-end">
              <div className="col-md-2">
                <label className="form-label small mb-1">Estado</label>
                <select className="form-select form-select-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="open">Abierto</option>
                  <option value="in_progress">En progreso</option>
                  <option value="closed">Cerrado</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small mb-1">Email usuario</label>
                <input
                  className="form-control form-control-sm"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="contiene…"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small mb-1">Desde</label>
                <input className="form-control form-control-sm" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="col-md-2">
                <label className="form-label small mb-1">Hasta</label>
                <input className="form-control form-control-sm" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
              <div className="col-md-2">
                <button type="button" className="btn btn-primary btn-sm w-100" onClick={() => void load()}>
                  Aplicar filtros
                </button>
              </div>
            </div>
            {error ? <div className="alert alert-danger mt-3 mb-0">{error}</div> : null}
          </div>
        </div>

        <div className="card">
          <div className="card-body p-0">
            {loading ? (
              <div className="p-4 text-center text-muted">Cargando…</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-muted">No hay tickets con estos filtros.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-sm mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Usuario</th>
                      <th>Asunto</th>
                      <th>Estado</th>
                      <th>Img</th>
                      <th>Creado</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((t) => (
                      <tr key={t.id}>
                        <td className="fw-semibold text-nowrap">#{t.ticketNumber}</td>
                        <td className="small">
                          <div>{t.user?.email}</div>
                          <div className="text-muted">
                            {[t.user?.firstName, t.user?.lastName].filter(Boolean).join(' ') || '—'}
                          </div>
                        </td>
                        <td>{t.subject}</td>
                        <td>
                          <span className="badge bg-secondary">{STATUS_LABEL[t.status] ?? t.status}</span>
                        </td>
                        <td className="small text-muted">{t.attachmentCount ?? 0}</td>
                        <td className="small text-muted text-nowrap">{new Date(t.createdAt).toLocaleString()}</td>
                        <td className="text-end">
                          <Link href={`/admin/config/support-tickets/${t.id}`} className="btn btn-sm btn-outline-primary">
                            Abrir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && total > 0 ? (
              <div className="p-2 border-top small text-muted">Total: {total} (mostrando {items.length})</div>
            ) : null}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
