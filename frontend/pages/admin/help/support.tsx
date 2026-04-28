import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/axios';

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

const STATUS_LABEL: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En progreso',
  closed: 'Cerrado',
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
  const [items, setItems] = useState<TicketItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setListError('');
    try {
      const res = await api.get('/support-tickets', { params: { limit: 50, offset: 0 } });
      setItems(Array.isArray(res.data?.items) ? res.data.items : []);
      setTotal(typeof res.data?.total === 'number' ? res.data.total : 0);
    } catch (e: unknown) {
      setListError(apiErrorMessage(e, 'No se pudo cargar el listado de tickets.'));
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

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
        const t = (f.type || '').toLowerCase();
        const okMime = t === 'image/jpeg' || t === 'image/png' || t === 'image/pjpeg';
        if (!okMime) {
          setFormError('Solo se permiten imágenes JPG, JPEG o PNG.');
          return;
        }
        if (f.size > 5 * 1024 * 1024) {
          setFormError('Cada imagen debe pesar como máximo 5 MB.');
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
      setFormError(apiErrorMessage(err, 'No se pudo crear el ticket.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12 col-xl-10">
            <h1 className="mb-3">Soporte técnico</h1>
            <p className="lead text-muted mb-4">
              Abrí un ticket para reportar problemas o pedir ayuda. El equipo recibirá una notificación y podrás hacer
              seguimiento desde esta misma sección.
            </p>

            <div className="card mb-4 border-info">
              <div className="card-header bg-info bg-opacity-10">
                <h2 className="h5 mb-0">Documentación</h2>
              </div>
              <div className="card-body">
                <p className="mb-0">
                  Para uso de la app, revisá la <Link href="/admin/help/documentation">documentación del panel</Link>.
                </p>
              </div>
            </div>

            <div className="card mb-4 border-warning">
              <div className="card-header bg-warning text-dark">
                <h2 className="h5 mb-0">Consejos para un buen reporte</h2>
              </div>
              <div className="card-body">
                <ul className="mb-0">
                  <li>Describí qué esperabas y qué ocurrió en su lugar.</li>
                  <li>Pasos concretos para reproducir el problema.</li>
                  <li>Navegador, sistema operativo y si es en móvil o escritorio.</li>
                  <li>Texto de mensajes de error o lo que veas en consola (F12).</li>
                  <li>Podés adjuntar capturas en JPG o PNG (hasta 5 imágenes, 5 MB cada una).</li>
                </ul>
              </div>
            </div>

            <div className="card mb-4 border-primary">
              <div className="card-header bg-primary text-white">
                <h2 className="h5 mb-0">Crear ticket</h2>
              </div>
              <div className="card-body">
                <form onSubmit={(ev) => void onCreate(ev)}>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="ticket-subject">
                      Asunto
                    </label>
                    <input
                      id="ticket-subject"
                      className="form-control"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      maxLength={200}
                      placeholder="Resumen breve del problema"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="ticket-message">
                      Descripción
                    </label>
                    <textarea
                      id="ticket-message"
                      className="form-control"
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={8000}
                      placeholder="Incluí pasos para reproducir, navegador, mensajes de error…"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="ticket-files">
                      Imágenes adjuntas (opcional)
                    </label>
                    <input
                      id="ticket-files"
                      type="file"
                      className="form-control"
                      accept={ACCEPT_IMAGES}
                      multiple
                      onChange={onFilesChange}
                    />
                    <small className="text-muted d-block mt-1">JPG, JPEG o PNG. Máximo 5 archivos, 5 MB c/u.</small>
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
                    {submitting ? 'Enviando…' : 'Enviar ticket'}
                  </button>
                </form>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h2 className="h5 mb-0">Mis tickets</h2>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => void load()} disabled={loading}>
                  Actualizar
                </button>
              </div>
              <div className="card-body p-0">
                {listError ? <div className="alert alert-danger m-3 mb-0">{listError}</div> : null}
                {loading ? (
                  <div className="p-4 text-center text-muted">Cargando…</div>
                ) : items.length === 0 ? (
                  <div className="p-4 text-muted">Todavía no tenés tickets. Usá el formulario de arriba para crear uno.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Asunto</th>
                          <th>Estado</th>
                          <th>Adj.</th>
                          <th>Actualizado</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((t) => (
                          <tr key={t.id}>
                            <td className="text-nowrap fw-semibold">#{t.ticketNumber}</td>
                            <td>{t.subject}</td>
                            <td>
                              <span className="badge bg-secondary">{STATUS_LABEL[t.status] ?? t.status}</span>
                            </td>
                            <td className="small text-muted">{t.attachmentUrls?.length ?? 0}</td>
                            <td className="small text-muted">{new Date(t.updatedAt).toLocaleString()}</td>
                            <td className="text-end">
                              <Link href={`/admin/help/support/${t.id}`} className="btn btn-sm btn-outline-primary">
                                Ver
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {!loading && total > items.length ? (
                  <div className="p-2 text-muted small border-top">Mostrando {items.length} de {total} tickets.</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
