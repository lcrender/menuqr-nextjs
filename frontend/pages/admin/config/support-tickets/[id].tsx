import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';
import api from '../../../../lib/axios';

type MessageRow = {
  id: string;
  authorUserId: string;
  authorRole: string;
  message: string;
  createdAt: string;
};

type UserBlock = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  tenant: { id: string; name: string; plan: string; status: string } | null;
  tenantPlan: string | null;
  subscriptions: Array<{
    id: string;
    paymentProvider: string;
    status: string;
    planType: string;
    subscriptionPlan: string | null;
    currentPeriodEnd: string | null;
    updatedAt: string;
  }>;
  effectivePlan: string | null;
};

type AdminTicketDetail = {
  id: string;
  ticketNumber: number;
  subject: string;
  initialMessage: string;
  attachmentUrls?: string[];
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  lastReplyAt: string | null;
  lastReplyByRole: string | null;
  messages: MessageRow[];
  user: UserBlock;
};

const STATUS_LABEL: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En progreso',
  closed: 'Cerrado',
};

export default function AdminSupportTicketDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const ticketId = typeof id === 'string' ? id : '';

  const [ticket, setTicket] = useState<AdminTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState('');
  const [sending, setSending] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  const load = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/support-tickets/admin/${ticketId}`);
      setTicket(res.data as AdminTicketDetail);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' ') : msg || 'No se pudo cargar el ticket.');
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (ticketId) void load();
  }, [ticketId, load]);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId) return;
    setReplyError('');
    setSending(true);
    try {
      await api.post(`/support-tickets/admin/${ticketId}/messages`, { message: reply.trim() });
      setReply('');
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setReplyError(Array.isArray(msg) ? msg.join(' ') : msg || 'No se pudo enviar la respuesta.');
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (next: 'open' | 'in_progress' | 'closed') => {
    if (!ticketId) return;
    setStatusSaving(true);
    try {
      await api.patch(`/support-tickets/admin/${ticketId}/status`, { status: next });
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join(' ') : msg || 'No se pudo actualizar el estado.');
    } finally {
      setStatusSaving(false);
    }
  };

  const u = ticket?.user;

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link href="/admin/config/support-tickets">Tickets</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              #{ticket?.ticketNumber ?? '…'}
            </li>
          </ol>
        </nav>

        {loading ? (
          <p className="text-muted">Cargando…</p>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : ticket && u ? (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                <div>
                  <h1 className="h4 mb-1">
                    #{ticket.ticketNumber} — {ticket.subject}
                  </h1>
                  <p className="text-muted small mb-0">
                    Creado {new Date(ticket.createdAt).toLocaleString()} ·{' '}
                    <span className="badge bg-secondary">{STATUS_LABEL[ticket.status] ?? ticket.status}</span>
                  </p>
                </div>
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={statusSaving || ticket.status === 'open'}
                    onClick={() => void changeStatus('open')}
                  >
                    Abierto
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={statusSaving || ticket.status === 'in_progress'}
                    onClick={() => void changeStatus('in_progress')}
                  >
                    En progreso
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={statusSaving || ticket.status === 'closed'}
                    onClick={() => void changeStatus('closed')}
                  >
                    Cerrado
                  </button>
                </div>
              </div>

              {ticket.attachmentUrls && ticket.attachmentUrls.length > 0 ? (
                <div className="card mb-4">
                  <div className="card-header">Imágenes adjuntas</div>
                  <div className="card-body d-flex flex-wrap gap-3">
                    {ticket.attachmentUrls.map((u) => (
                      <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="d-block">
                        <img src={u} alt="" className="img-thumbnail" style={{ maxWidth: 220, maxHeight: 220, objectFit: 'cover' }} />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="card mb-4">
                <div className="card-header">Historial</div>
                <ul className="list-group list-group-flush">
                  {ticket.messages.map((m) => (
                    <li key={m.id} className="list-group-item">
                      <div className="d-flex justify-content-between flex-wrap gap-2">
                        <strong className="small text-capitalize">{m.authorRole.toLowerCase().replace('_', ' ')}</strong>
                        <span className="small text-muted">{new Date(m.createdAt).toLocaleString()}</span>
                      </div>
                      <pre className="mb-0 mt-2 text-wrap" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                        {m.message}
                      </pre>
                    </li>
                  ))}
                </ul>
              </div>

              {ticket.status === 'closed' ? (
                <div className="alert alert-secondary">Ticket cerrado. Reabrilo (estado Abierto o En progreso) para responder.</div>
              ) : (
                <div className="card mb-4">
                  <div className="card-header">Respuesta (Super Admin)</div>
                  <div className="card-body">
                    <form onSubmit={(ev) => void sendReply(ev)}>
                      <textarea
                        className="form-control mb-2"
                        rows={4}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        maxLength={8000}
                        required
                        placeholder="Respuesta al usuario…"
                      />
                      {replyError ? <div className="alert alert-danger py-2">{replyError}</div> : null}
                      <button type="submit" className="btn btn-primary" disabled={sending}>
                        {sending ? 'Enviando…' : 'Enviar respuesta'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>

            <div className="col-lg-4">
              <div className="card border-info">
                <div className="card-header bg-info bg-opacity-10">Usuario</div>
                <div className="card-body small">
                  <p className="mb-1">
                    <strong>Email:</strong> {u.email}
                  </p>
                  <p className="mb-1">
                    <strong>Nombre:</strong> {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                  </p>
                  <p className="mb-1">
                    <strong>Rol:</strong> {u.role}
                  </p>
                  <p className="mb-1">
                    <strong>Tenant:</strong> {u.tenant ? `${u.tenant.name} (${u.tenant.plan})` : '—'}
                  </p>
                  <p className="mb-2">
                    <strong>Plan efectivo (resumen):</strong> {u.effectivePlan ?? u.tenantPlan ?? '—'}
                  </p>
                  <h6 className="text-muted mt-3">Suscripciones recientes</h6>
                  {u.subscriptions?.length ? (
                    <ul className="list-unstyled mb-0">
                      {u.subscriptions.map((s) => (
                        <li key={s.id} className="mb-2 border-bottom pb-2">
                          <div>
                            <span className="badge bg-light text-dark me-1">{s.paymentProvider}</span>
                            <span className="badge bg-secondary">{s.status}</span>
                          </div>
                          <div className="text-muted">
                            Plan: {s.subscriptionPlan ?? '—'} · {s.planType}
                          </div>
                          <div className="text-muted">Fin período: {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : '—'}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">Sin filas de suscripción.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
