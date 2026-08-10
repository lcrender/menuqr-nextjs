import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../../../components/AdminLayout';
import api from '../../../../lib/axios';
import i18n from '../../../../src/i18n/config';
import adminSupportTicketsEs from '../../../../src/locales/fragments/adminSupportTickets.es.json';
import adminSupportTicketsEn from '../../../../src/locales/fragments/adminSupportTickets.en.json';

i18n.addResourceBundle('es-ES', 'translation', { adminSupportTickets: adminSupportTicketsEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { adminSupportTickets: adminSupportTicketsEn }, true, true);

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
  caseGroupId: string;
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
  relatedTickets?: Array<{
    id: string;
    ticketNumber: number;
    subject: string;
    status: 'open' | 'in_progress' | 'closed';
    createdAt: string;
    updatedAt: string;
    userId: string;
  }>;
  user: UserBlock;
};

export default function AdminSupportTicketDetailPage() {
  const { t } = useTranslation();
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
  const [linkNumber, setLinkNumber] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState('');

  const statusLabel = (s: string) => {
    if (s === 'open' || s === 'in_progress' || s === 'closed') {
      return t(`adminSupportTickets.status.${s}`);
    }
    return s;
  };

  const load = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/support-tickets/admin/${ticketId}`);
      setTicket(res.data as AdminTicketDetail);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' ') : msg || t('adminSupportTickets.errors.loadTicket'));
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
      await api.post(`/support-tickets/admin/${ticketId}/messages`, { message: reply.trim() });
      setReply('');
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setReplyError(Array.isArray(msg) ? msg.join(' ') : msg || t('adminSupportTickets.errors.sendReply'));
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
      alert(Array.isArray(msg) ? msg.join(' ') : msg || t('adminSupportTickets.errors.updateStatus'));
    } finally {
      setStatusSaving(false);
    }
  };

  const linkCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId) return;
    setLinkError('');
    const n = parseInt(linkNumber, 10);
    if (!Number.isFinite(n) || n <= 0) {
      setLinkError(t('adminSupportTickets.errors.invalidTicketNumber'));
      return;
    }
    setLinking(true);
    try {
      await api.patch(`/support-tickets/admin/${ticketId}/link-case`, {
        targetTicketNumber: n,
      });
      setLinkNumber('');
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setLinkError(Array.isArray(msg) ? msg.join(' ') : msg || t('adminSupportTickets.errors.linkTicket'));
    } finally {
      setLinking(false);
    }
  };

  const u = ticket?.user;
  const dash = t('adminSupportTickets.emDash');

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link href="/admin/config/support-tickets">{t('adminSupportTickets.detail.breadcrumbTickets')}</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              #{ticket?.ticketNumber ?? t('adminSupportTickets.ellipsis')}
            </li>
          </ol>
        </nav>

        {loading ? (
          <p className="text-muted">{t('adminSupportTickets.loading')}</p>
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
                    {t('adminSupportTickets.detail.createdAt', {
                      date: new Date(ticket.createdAt).toLocaleString(),
                    })}{' '}
                    · <span className="badge bg-secondary">{statusLabel(ticket.status)}</span>
                  </p>
                  <p className="text-muted small mb-0">
                    {t('adminSupportTickets.detail.caseId', { id: ticket.caseGroupId })}
                  </p>
                </div>
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={statusSaving || ticket.status === 'open'}
                    onClick={() => void changeStatus('open')}
                  >
                    {t('adminSupportTickets.status.open')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={statusSaving || ticket.status === 'in_progress'}
                    onClick={() => void changeStatus('in_progress')}
                  >
                    {t('adminSupportTickets.status.in_progress')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={statusSaving || ticket.status === 'closed'}
                    onClick={() => void changeStatus('closed')}
                  >
                    {t('adminSupportTickets.status.closed')}
                  </button>
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-header">{t('adminSupportTickets.detail.linkCase.title')}</div>
                <div className="card-body">
                  <form className="row g-2 align-items-end" onSubmit={(ev) => void linkCase(ev)}>
                    <div className="col-md-6">
                      <label className="form-label mb-1">{t('adminSupportTickets.detail.linkCase.ticketNumber')}</label>
                      <input
                        type="number"
                        min={1}
                        className="form-control"
                        placeholder={t('adminSupportTickets.detail.linkCase.placeholder')}
                        value={linkNumber}
                        onChange={(e) => setLinkNumber(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <button type="submit" className="btn btn-outline-primary" disabled={linking}>
                        {linking
                          ? t('adminSupportTickets.detail.linkCase.linking')
                          : t('adminSupportTickets.detail.linkCase.submit')}
                      </button>
                    </div>
                  </form>
                  {linkError ? <div className="alert alert-danger py-2 mt-3 mb-0">{linkError}</div> : null}
                </div>
              </div>

              {ticket.relatedTickets && ticket.relatedTickets.length > 1 ? (
                <div className="card mb-4">
                  <div className="card-header">{t('adminSupportTickets.detail.related.title')}</div>
                  <div className="table-responsive">
                    <table className="table table-sm table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>{t('adminSupportTickets.table.number')}</th>
                          <th>{t('adminSupportTickets.table.subject')}</th>
                          <th>{t('adminSupportTickets.table.status')}</th>
                          <th>{t('adminSupportTickets.table.updated')}</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {ticket.relatedTickets.map((rt) => (
                          <tr key={rt.id}>
                            <td>#{rt.ticketNumber}</td>
                            <td>{rt.subject}</td>
                            <td>
                              <span className="badge bg-secondary">{statusLabel(rt.status)}</span>
                            </td>
                            <td className="small text-muted">{new Date(rt.updatedAt).toLocaleString()}</td>
                            <td className="text-end">
                              {rt.id === ticket.id ? (
                                <span className="small text-muted">{t('adminSupportTickets.table.current')}</span>
                              ) : (
                                <Link href={`/admin/config/support-tickets/${rt.id}`} className="btn btn-sm btn-outline-primary">
                                  {t('adminSupportTickets.table.open')}
                                </Link>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {ticket.attachmentUrls && ticket.attachmentUrls.length > 0 ? (
                <div className="card mb-4">
                  <div className="card-header">{t('adminSupportTickets.detail.attachments.title')}</div>
                  <div className="card-body d-flex flex-wrap gap-3">
                    {ticket.attachmentUrls.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="d-block">
                        <img src={url} alt="" className="img-thumbnail" style={{ maxWidth: 220, maxHeight: 220, objectFit: 'cover' }} />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="card mb-4">
                <div className="card-header">{t('adminSupportTickets.detail.history.title')}</div>
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
                <div className="alert alert-secondary">{t('adminSupportTickets.detail.closedNotice')}</div>
              ) : (
                <div className="card mb-4">
                  <div className="card-header">{t('adminSupportTickets.detail.reply.title')}</div>
                  <div className="card-body">
                    <form onSubmit={(ev) => void sendReply(ev)}>
                      <textarea
                        className="form-control mb-2"
                        rows={4}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        maxLength={8000}
                        required
                        placeholder={t('adminSupportTickets.detail.reply.placeholder')}
                      />
                      {replyError ? <div className="alert alert-danger py-2">{replyError}</div> : null}
                      <button type="submit" className="btn btn-primary" disabled={sending}>
                        {sending
                          ? t('adminSupportTickets.detail.reply.sending')
                          : t('adminSupportTickets.detail.reply.submit')}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>

            <div className="col-lg-4">
              <div className="card border-info">
                <div className="card-header bg-info bg-opacity-10">{t('adminSupportTickets.detail.userPanel.title')}</div>
                <div className="card-body small">
                  <p className="mb-1">
                    <strong>{t('adminSupportTickets.detail.userPanel.email')}</strong> {u.email}
                  </p>
                  <p className="mb-1">
                    <strong>{t('adminSupportTickets.detail.userPanel.name')}</strong>{' '}
                    {[u.firstName, u.lastName].filter(Boolean).join(' ') || dash}
                  </p>
                  <p className="mb-1">
                    <strong>{t('adminSupportTickets.detail.userPanel.role')}</strong> {u.role}
                  </p>
                  <p className="mb-1">
                    <strong>{t('adminSupportTickets.detail.userPanel.tenant')}</strong>{' '}
                    {u.tenant
                      ? t('adminSupportTickets.detail.userPanel.tenantValue', {
                          name: u.tenant.name,
                          plan: u.tenant.plan,
                        })
                      : dash}
                  </p>
                  <p className="mb-2">
                    <strong>{t('adminSupportTickets.detail.userPanel.effectivePlan')}</strong>{' '}
                    {u.effectivePlan ?? u.tenantPlan ?? dash}
                  </p>
                  <h6 className="text-muted mt-3">{t('adminSupportTickets.detail.userPanel.subscriptionsTitle')}</h6>
                  {u.subscriptions?.length ? (
                    <ul className="list-unstyled mb-0">
                      {u.subscriptions.map((s) => (
                        <li key={s.id} className="mb-2 border-bottom pb-2">
                          <div>
                            <span className="badge bg-light text-dark me-1">{s.paymentProvider}</span>
                            <span className="badge bg-secondary">{s.status}</span>
                          </div>
                          <div className="text-muted">
                            {t('adminSupportTickets.detail.userPanel.planLine', {
                              plan: s.subscriptionPlan ?? dash,
                              planType: s.planType,
                            })}
                          </div>
                          <div className="text-muted">
                            {t('adminSupportTickets.detail.userPanel.periodEnd', {
                              date: s.currentPeriodEnd
                                ? new Date(s.currentPeriodEnd).toLocaleDateString()
                                : dash,
                            })}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">{t('adminSupportTickets.detail.userPanel.noSubscriptions')}</p>
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
