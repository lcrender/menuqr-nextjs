import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/axios';
import i18n from '../../../src/i18n/config';
import adminSupportTicketsEs from '../../../src/locales/fragments/adminSupportTickets.es.json';
import adminSupportTicketsEn from '../../../src/locales/fragments/adminSupportTickets.en.json';

i18n.addResourceBundle('es-ES', 'translation', { adminSupportTickets: adminSupportTicketsEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { adminSupportTickets: adminSupportTicketsEn }, true, true);

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

export default function AdminSupportTicketsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<TicketRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const statusLabel = (s: string) => {
    if (s === 'open' || s === 'in_progress' || s === 'closed') {
      return t(`adminSupportTickets.status.${s}`);
    }
    return s;
  };

  const load = async (
    st: string = status,
    em: string = userEmail,
    fr: string = from,
    tDate: string = to,
  ) => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { limit: '100', offset: '0' };
      if (st) params.status = st;
      if (em.trim()) params.userEmail = em.trim();
      if (fr) params.from = fr;
      if (tDate) params.to = tDate;
      const res = await api.get('/support-tickets/admin', { params });
      setItems(Array.isArray(res.data?.items) ? res.data.items : []);
      setTotal(typeof res.data?.total === 'number' ? res.data.total : 0);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' ') : msg || t('adminSupportTickets.errors.loadList'));
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
        <h1 className="h4 mb-3">{t('adminSupportTickets.title')}</h1>
        <p className="text-muted small mb-4">{t('adminSupportTickets.subtitle')}</p>

        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-2 align-items-end">
              <div className="col-md-2">
                <label className="form-label small mb-1">{t('adminSupportTickets.filters.status')}</label>
                <select className="form-select form-select-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">{t('adminSupportTickets.filters.all')}</option>
                  <option value="open">{t('adminSupportTickets.status.open')}</option>
                  <option value="in_progress">{t('adminSupportTickets.status.in_progress')}</option>
                  <option value="closed">{t('adminSupportTickets.status.closed')}</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small mb-1">{t('adminSupportTickets.filters.userEmail')}</label>
                <input
                  className="form-control form-control-sm"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder={t('adminSupportTickets.filters.userEmailPlaceholder')}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small mb-1">{t('adminSupportTickets.filters.from')}</label>
                <input className="form-control form-control-sm" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="col-md-2">
                <label className="form-label small mb-1">{t('adminSupportTickets.filters.to')}</label>
                <input className="form-control form-control-sm" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
              <div className="col-md-2">
                <button type="button" className="btn btn-primary btn-sm w-100" onClick={() => void load()}>
                  {t('adminSupportTickets.filters.apply')}
                </button>
              </div>
            </div>
            {error ? <div className="alert alert-danger mt-3 mb-0">{error}</div> : null}
          </div>
        </div>

        <div className="card">
          <div className="card-body p-0">
            {loading ? (
              <div className="p-4 text-center text-muted">{t('adminSupportTickets.loading')}</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-muted">{t('adminSupportTickets.table.empty')}</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-sm mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t('adminSupportTickets.table.number')}</th>
                      <th>{t('adminSupportTickets.table.user')}</th>
                      <th>{t('adminSupportTickets.table.subject')}</th>
                      <th>{t('adminSupportTickets.table.status')}</th>
                      <th>{t('adminSupportTickets.table.images')}</th>
                      <th>{t('adminSupportTickets.table.created')}</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row) => (
                      <tr key={row.id}>
                        <td className="fw-semibold text-nowrap">#{row.ticketNumber}</td>
                        <td className="small">
                          <div>{row.user?.email}</div>
                          <div className="text-muted">
                            {[row.user?.firstName, row.user?.lastName].filter(Boolean).join(' ') ||
                              t('adminSupportTickets.emDash')}
                          </div>
                        </td>
                        <td>{row.subject}</td>
                        <td>
                          <span className="badge bg-secondary">{statusLabel(row.status)}</span>
                        </td>
                        <td className="small text-muted">{row.attachmentCount ?? 0}</td>
                        <td className="small text-muted text-nowrap">{new Date(row.createdAt).toLocaleString()}</td>
                        <td className="text-end">
                          <Link href={`/admin/config/support-tickets/${row.id}`} className="btn btn-sm btn-outline-primary">
                            {t('adminSupportTickets.table.open')}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && total > 0 ? (
              <div className="p-2 border-top small text-muted">
                {t('adminSupportTickets.table.total', { total, showing: items.length })}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
