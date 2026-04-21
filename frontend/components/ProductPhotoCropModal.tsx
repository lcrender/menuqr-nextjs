import { useState, useCallback, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, MediaSize, Point, Size } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { getEasyCropPixelsForExport } from '../lib/easy-crop-area';
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
  const mediaSizeRef = useRef<MediaSize | null>(null);
  const cropSizeRef = useRef<Size | null>(null);

  const onCropChange = useCallback((c: Point) => {
    setCrop(c);
  }, []);

  const onZoomFromCropper = useCallback((z: number) => {
    setZoom(z);
  }, []);

  const onCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const syncMediaSize = useCallback((s: MediaSize) => {
    mediaSizeRef.current = {
      width: s.width,
      height: s.height,
      naturalWidth: s.naturalWidth,
      naturalHeight: s.naturalHeight,
    };
  }, []);

  const syncCropSize = useCallback((s: Size) => {
    cropSizeRef.current = { width: s.width, height: s.height };
  }, []);

  useEffect(() => {
    if (show && imageSrc) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setError(null);
      mediaSizeRef.current = null;
      cropSizeRef.current = null;
    }
  }, [show, imageSrc]);

  const handleConfirm = async () => {
    if (!imageSrc) return;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
    const ms = mediaSizeRef.current;
    const cs = cropSizeRef.current;
    const frameAspect =
      cs && cs.height > 0 ? (Math.abs(cs.width / cs.height - 1) < 1e-5 ? 1 : cs.width / cs.height) : 1;
    const pixelCrop =
      ms && cs
        ? getEasyCropPixelsForExport({
            crop,
            zoom,
            rotation: 0,
            aspect: frameAspect,
            mediaSize: ms,
            cropSize: cs,
            restrictPosition: false,
          })
        : croppedAreaPixels;
    if (!pixelCrop) return;
    setBusy(true);
    setError(null);
    try {
      const file = await exportProductWebpFile(imageSrc, pixelCrop);
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
    mediaSizeRef.current = null;
    cropSizeRef.current = null;
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
                rotation={0}
                minZoom={0.01}
                maxZoom={3}
                aspect={1}
                objectFit="contain"
                restrictPosition={false}
                cropShape="rect"
                showGrid={false}
                zoomWithScroll={false}
                onCropChange={onCropChange}
                onCropComplete={onCropComplete}
                onCropAreaChange={onCropComplete}
                onZoomChange={onZoomFromCropper}
                setMediaSize={syncMediaSize}
                setCropSize={syncCropSize}
              />
            </div>

            <div className="mt-3">
              <label className="form-label small mb-1">Zoom</label>
              <input
                type="range"
                className="form-range"
                min={0.01}
                max={3}
                step={0.01}
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
