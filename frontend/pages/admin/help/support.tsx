import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/axios';
import i18n from '../../../src/i18n/config';
import adminSupportEs from '../../../src/locales/fragments/adminSupport.es.json';
import adminSupportEn from '../../../src/locales/fragments/adminSupport.en.json';

i18n.addResourceBundle('es-ES', 'translation', { adminSupport: adminSupportEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { adminSupport: adminSupportEn }, true, true);

type TicketItem = {
  id: string;
  ticketNumber: number;
  subject: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  updatedAt: string;
  lastReplyAt: string | null;
  attachmentUrls?: string[];
};

const ACCEPT_IMAGES = 'image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png';

function apiErrorMessage(e: unknown, fallback: string): string {
  const err = e as { response?: { data?: { message?: string | string[] } } };
  const m = err?.response?.data?.message;
  if (Array.isArray(m)) return m.join(' ');
  if (typeof m === 'string' && m.trim()) return m;
  return fallback;
}

export default function SupportPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<TicketItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setListError('');
    try {
      const res = await api.get('/support-tickets', { params: { limit: 50, offset: 0 } });
      setItems(Array.isArray(res.data?.items) ? res.data.items : []);
      setTotal(typeof res.data?.total === 'number' ? res.data.total : 0);
    } catch (e: unknown) {
      setListError(apiErrorMessage(e, t('adminSupport.alerts.listLoadError')));
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    const next = list.slice(0, 5);
    setFiles(next);
    e.target.value = '';
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      for (const f of files) {
        const mime = (f.type || '').toLowerCase();
        const okMime = mime === 'image/jpeg' || mime === 'image/png' || mime === 'image/pjpeg';
        if (!okMime) {
          setFormError(t('adminSupport.alerts.invalidImageType'));
          return;
        }
        if (f.size > 5 * 1024 * 1024) {
          setFormError(t('adminSupport.alerts.imageTooLarge'));
          return;
        }
      }
      const attachmentUrls: string[] = [];
      for (const f of files) {
        const fd = new FormData();
        fd.append('file', f);
        const up = await api.post('/support-tickets/attachments', fd);
        const url = up.data?.url;
        if (typeof url === 'string') attachmentUrls.push(url);
      }
      await api.post('/support-tickets', {
        subject: subject.trim(),
        message: message.trim(),
        attachmentUrls: attachmentUrls.length ? attachmentUrls : undefined,
      });
      setSubject('');
      setMessage('');
      setFiles([]);
      await load();
    } catch (err: unknown) {
      setFormError(apiErrorMessage(err, t('adminSupport.alerts.createError')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12 col-xl-10">
            <h1 className="mb-3">{t('adminSupport.title')}</h1>
            <p className="lead text-muted mb-4">{t('adminSupport.lead')}</p>

            <div className="card mb-4 border-info">
              <div className="card-header bg-info bg-opacity-10">
                <h2 className="h5 mb-0">{t('adminSupport.docsCard.title')}</h2>
              </div>
              <div className="card-body">
                <p className="mb-0">
                  <Trans
                    i18nKey="adminSupport.docsCard.body"
                    components={{
                      docsLink: <Link href="/admin/help/documentation" />,
                    }}
                  />
                </p>
              </div>
            </div>

            <div className="card mb-4 border-warning">
              <div className="card-header bg-warning text-dark">
                <h2 className="h5 mb-0">{t('adminSupport.tips.title')}</h2>
              </div>
              <div className="card-body">
                <ul className="mb-0">
                  <li>{t('adminSupport.tips.expectedVsActual')}</li>
                  <li>{t('adminSupport.tips.reproSteps')}</li>
                  <li>{t('adminSupport.tips.environment')}</li>
                  <li>{t('adminSupport.tips.errors')}</li>
                  <li>{t('adminSupport.tips.attachments')}</li>
                </ul>
              </div>
            </div>

            <div className="card mb-4 border-primary">
              <div className="card-header bg-primary text-white">
                <h2 className="h5 mb-0">{t('adminSupport.form.title')}</h2>
              </div>
              <div className="card-body">
                <form onSubmit={(ev) => void onCreate(ev)}>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="ticket-subject">
                      {t('adminSupport.form.subject')}
                    </label>
                    <input
                      id="ticket-subject"
                      className="form-control"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      maxLength={200}
                      placeholder={t('adminSupport.form.subjectPlaceholder')}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="ticket-message">
                      {t('adminSupport.form.description')}
                    </label>
                    <textarea
                      id="ticket-message"
                      className="form-control"
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={8000}
                      placeholder={t('adminSupport.form.descriptionPlaceholder')}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="ticket-files">
                      {t('adminSupport.form.attachments')}
                    </label>
                    <input
                      ref={fileInputRef}
                      id="ticket-files"
                      type="file"
                      className="d-none"
                      accept={ACCEPT_IMAGES}
                      multiple
                      onChange={onFilesChange}
                    />
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {t('adminSupport.form.chooseFiles')}
                      </button>
                      <span className="text-muted small">
                        {files.length === 0
                          ? t('adminSupport.form.noFilesSelected')
                          : t('adminSupport.form.filesSelected', { count: files.length })}
                      </span>
                    </div>
                    <small className="text-muted d-block mt-1">{t('adminSupport.form.attachmentsHint')}</small>
                    {files.length > 0 ? (
                      <ul className="small mb-0 mt-2">
                        {files.map((f) => (
                          <li key={f.name + f.size}>{f.name}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  {formError ? <div className="alert alert-danger py-2">{formError}</div> : null}
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? t('adminSupport.form.submitting') : t('adminSupport.form.submit')}
                  </button>
                </form>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h2 className="h5 mb-0">{t('adminSupport.list.title')}</h2>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => void load()} disabled={loading}>
                  {t('adminSupport.list.refresh')}
                </button>
              </div>
              <div className="card-body p-0">
                {listError ? <div className="alert alert-danger m-3 mb-0">{listError}</div> : null}
                {loading ? (
                  <div className="p-4 text-center text-muted">{t('adminSupport.list.loading')}</div>
                ) : items.length === 0 ? (
                  <div className="p-4 text-muted">{t('adminSupport.list.empty')}</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>{t('adminSupport.list.colNumber')}</th>
                          <th>{t('adminSupport.list.colSubject')}</th>
                          <th>{t('adminSupport.list.colStatus')}</th>
                          <th>{t('adminSupport.list.colAttachments')}</th>
                          <th>{t('adminSupport.list.colUpdated')}</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((ticket) => (
                          <tr key={ticket.id}>
                            <td className="text-nowrap fw-semibold">#{ticket.ticketNumber}</td>
                            <td>{ticket.subject}</td>
                            <td>
                              <span className="badge bg-secondary">
                                {t(`adminSupport.status.${ticket.status}`)}
                              </span>
                            </td>
                            <td className="small text-muted">{ticket.attachmentUrls?.length ?? 0}</td>
                            <td className="small text-muted">{new Date(ticket.updatedAt).toLocaleString()}</td>
                            <td className="text-end">
                              <Link href={`/admin/help/support/${ticket.id}`} className="btn btn-sm btn-outline-primary">
                                {t('adminSupport.list.view')}
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {!loading && total > items.length ? (
                  <div className="p-2 text-muted small border-top">
                    {t('adminSupport.list.showing', { shown: items.length, total })}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
