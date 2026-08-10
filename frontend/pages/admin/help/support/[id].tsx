import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../../../components/AdminLayout';
import api from '../../../../lib/axios';
import i18n from '../../../../src/i18n/config';
import adminSupportEs from '../../../../src/locales/fragments/adminSupport.es.json';
import adminSupportEn from '../../../../src/locales/fragments/adminSupport.en.json';

i18n.addResourceBundle('es-ES', 'translation', { adminSupport: adminSupportEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { adminSupport: adminSupportEn }, true, true);

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
  attachmentUrls?: string[];
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  lastReplyAt: string | null;
  lastReplyByRole: string | null;
  messages: MessageRow[];
};

export default function SupportTicketDetailPage() {
  const { t } = useTranslation();
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
      setError(Array.isArray(msg) ? msg.join(' ') : msg || t('adminSupport.alerts.ticketLoadError'));
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [ticketId, t]);

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
      setReplyError(Array.isArray(msg) ? msg.join(' ') : msg || t('adminSupport.alerts.replyError'));
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link href="/admin/help/support">{t('adminSupport.detail.breadcrumbSupport')}</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {ticket?.ticketNumber != null
                ? t('adminSupport.detail.breadcrumbTicket', { number: ticket.ticketNumber })
                : t('adminSupport.detail.breadcrumbTicketLoading')}
            </li>
          </ol>
        </nav>

        {loading ? (
          <p className="text-muted">{t('adminSupport.detail.loading')}</p>
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
                  {t('adminSupport.detail.createdStatus', {
                    date: new Date(ticket.createdAt).toLocaleString(),
                  })}{' '}
                  <span className="badge bg-secondary">
                    {t(`adminSupport.status.${ticket.status}`)}
                  </span>
                </p>
              </div>
            </div>

            {ticket.attachmentUrls && ticket.attachmentUrls.length > 0 ? (
              <div className="card mb-4">
                <div className="card-header">{t('adminSupport.detail.attachmentsTitle')}</div>
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
              <div className="card-header">{t('adminSupport.detail.historyTitle')}</div>
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
              <div className="alert alert-secondary">{t('adminSupport.detail.closedMessage')}</div>
            ) : (
              <div className="card mb-4">
                <div className="card-header">{t('adminSupport.detail.replyTitle')}</div>
                <div className="card-body">
                  <form onSubmit={(ev) => void sendReply(ev)}>
                    <textarea
                      className="form-control mb-2"
                      rows={4}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      maxLength={8000}
                      required
                      placeholder={t('adminSupport.detail.replyPlaceholder')}
                    />
                    {replyError ? <div className="alert alert-danger py-2">{replyError}</div> : null}
                    <button type="submit" className="btn btn-primary" disabled={sending}>
                      {sending ? t('adminSupport.detail.replySubmitting') : t('adminSupport.detail.replySubmit')}
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
