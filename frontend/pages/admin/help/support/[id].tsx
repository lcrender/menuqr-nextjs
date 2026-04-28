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

type TicketDetail = {
  id: string;
  ticketNumber: number;
  subject: string;
  initialMessage: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  lastReplyAt: string | null;
  lastReplyByRole: string | null;
  messages: MessageRow[];
};

const STATUS_LABEL: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En progreso',
  closed: 'Cerrado',
};

export default function SupportTicketDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const ticketId = typeof id === 'string' ? id : '';

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/support-tickets/${ticketId}`);
      setTicket(res.data as TicketDetail);
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
      await api.post(`/support-tickets/${ticketId}/messages`, { message: reply.trim() });
      setReply('');
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setReplyError(Array.isArray(msg) ? msg.join(' ') : msg || 'No se pudo enviar la respuesta.');
    } finally {
      setSending(false);
    }
  };

  const closed = ticket?.status === 'closed';

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link href="/admin/help/support">Soporte</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Ticket #{ticket?.ticketNumber ?? '…'}
            </li>
          </ol>
        </nav>

        {loading ? (
          <p className="text-muted">Cargando…</p>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : ticket ? (
          <>
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
              <div>
                <h1 className="h3 mb-1">
                  #{ticket.ticketNumber} — {ticket.subject}
                </h1>
                <p className="text-muted small mb-0">
                  Creado {new Date(ticket.createdAt).toLocaleString()} · Estado:{' '}
                  <span className="badge bg-secondary">{STATUS_LABEL[ticket.status] ?? ticket.status}</span>
                </p>
              </div>
            </div>

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

            {closed ? (
              <div className="alert alert-secondary">Este ticket está cerrado. No se pueden enviar más mensajes.</div>
            ) : (
              <div className="card mb-4">
                <div className="card-header">Tu respuesta</div>
                <div className="card-body">
                  <form onSubmit={(ev) => void sendReply(ev)}>
                    <textarea
                      className="form-control mb-2"
                      rows={4}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      maxLength={8000}
                      required
                      placeholder="Escribí tu mensaje…"
                    />
                    {replyError ? <div className="alert alert-danger py-2">{replyError}</div> : null}
                    <button type="submit" className="btn btn-primary" disabled={sending}>
                      {sending ? 'Enviando…' : 'Enviar respuesta'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
