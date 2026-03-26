import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { exportProductWebpFile } from '../lib/logo-image-export';

type Props = {
  show: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onComplete: (file: File) => void;
};

export default function ProductPhotoCropModal({ show, imageSrc, onClose, onComplete }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  useEffect(() => {
    if (show && imageSrc) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setError(null);
    }
  }, [show, imageSrc]);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setBusy(true);
    setError(null);
    try {
      const file = await exportProductWebpFile(imageSrc, croppedAreaPixels);
      onComplete(file);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al procesar la imagen');
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    if (busy) return;
    setError(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onClose();
  };

  if (!show || !imageSrc) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }} role="dialog" aria-modal="true">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Recortar foto de producto</h5>
            <button type="button" className="btn-close" aria-label="Cerrar" onClick={handleClose} disabled={busy} />
          </div>
          <div className="modal-body">
            <p className="text-muted small mb-2">
              Ajustá el encuadre para obtener una imagen en <strong>800×800</strong> px. Se guarda en <strong>WebP</strong> con máx. <strong>250 KB</strong>.
            </p>

            <div
              className="position-relative"
              style={{
                width: '100%',
                height: 320,
                background: '#1a1a1a',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="mt-3">
              <label className="form-label small mb-1">Zoom</label>
              <input
                type="range"
                className="form-range"
                min={1}
                max={3}
                step={0.02}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                disabled={busy}
              />
            </div>

            {error && <div className="alert alert-danger py-2 small mt-2 mb-0">{error}</div>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={busy}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={busy || !croppedAreaPixels}>
              {busy ? 'Procesando…' : 'Guardar foto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

