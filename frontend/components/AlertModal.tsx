import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

interface AlertModalProps {
  show: boolean;
  title: string;
  message: string;
  onClose: () => void;
  variant?: 'success' | 'error' | 'warning' | 'info';
  /** Botón principal adicional (ej. "Configurar plantilla" con enlace). */
  actionButton?: { label: string; href: string };
  /**
   * Solo para variant success (barra superior): tiempo hasta auto-cerrar, en ms.
   * Por defecto 5500. Mensajes largos (ej. registro) pueden usar 9000+.
   */
  toastAutoHideMs?: number;
}

function SuccessToastBanner({
  title,
  message,
  onClose,
  actionButton,
  autoHideMs,
}: {
  title: string;
  message: string;
  onClose: () => void;
  actionButton?: { label: string; href: string };
  autoHideMs: number;
}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const id = window.setTimeout(() => onCloseRef.current(), autoHideMs);
    return () => window.clearTimeout(id);
  }, [autoHideMs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="admin-flash-toast admin-flash-toast--success"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="admin-flash-toast__inner">
        <div className="admin-flash-toast__icon" aria-hidden>
          <span className="admin-flash-toast__check">✓</span>
        </div>
        <div className="admin-flash-toast__body">
          <div className="admin-flash-toast__title">{title}</div>
          <p className="admin-flash-toast__message">{message}</p>
        </div>
        <div className="admin-flash-toast__actions">
          {actionButton?.href ? (
            <Link
              href={actionButton.href}
              className="btn btn-sm btn-light text-success fw-semibold admin-flash-toast__link"
              onClick={onClose}
            >
              {actionButton.label}
            </Link>
          ) : null}
          <button
            type="button"
            className="btn btn-sm btn-link text-white admin-flash-toast__dismiss p-1"
            onClick={onClose}
            aria-label="Cerrar aviso"
          >
            <span className="admin-flash-toast__close-x" aria-hidden>
              ×
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function AlertModal({
  show,
  title,
  message,
  onClose,
  variant = 'info',
  actionButton,
  toastAutoHideMs,
}: AlertModalProps) {
  if (!show) return null;

  if (variant === 'success') {
    return (
      <SuccessToastBanner
        title={title}
        message={message}
        onClose={onClose}
        autoHideMs={toastAutoHideMs ?? 5500}
        {...(actionButton ? { actionButton } : {})}
      />
    );
  }

  const variantStyles = {
    success: {
      icon: 'bi-check-circle-fill',
      iconColor: '#198754',
      titleColor: '#0f5132',
      alertClass: 'alert-success',
      backgroundColor: '#d1e7dd',
      borderColor: '#badbcc',
    },
    error: {
      icon: 'bi-x-circle-fill',
      iconColor: '#dc3545',
      titleColor: '#721c24',
      alertClass: 'alert-danger',
      backgroundColor: '#f8d7da',
      borderColor: '#f5c2c7',
    },
    warning: {
      icon: 'bi-exclamation-triangle-fill',
      iconColor: '#ffc107',
      titleColor: '#856404',
      alertClass: 'alert-warning',
      backgroundColor: '#fff3cd',
      borderColor: '#ffc107',
    },
    info: {
      icon: 'bi-info-circle-fill',
      iconColor: '#0d6efd',
      titleColor: '#084298',
      alertClass: 'alert-info',
      backgroundColor: '#cfe2ff',
      borderColor: '#b6d4fe',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className="modal show"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6' }}>
            <h5 className="modal-title" style={{ color: style.titleColor }}>
              <i className={`bi ${style.icon} me-2`} style={{ color: style.iconColor }}></i>
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body" style={{ padding: '24px' }}>
            <div
              className={`alert ${style.alertClass} mb-0`}
              style={{
                backgroundColor: style.backgroundColor,
                border: `1px solid ${style.borderColor}`,
                borderRadius: '4px',
                padding: '12px',
              }}
            >
              <p style={{ marginBottom: 0, fontSize: '16px', whiteSpace: 'pre-line' }}>{message}</p>
            </div>
          </div>
          <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6' }}>
            <button type="button" className={actionButton?.href ? 'btn btn-secondary' : 'btn btn-primary'} onClick={onClose}>
              Aceptar
            </button>
            {actionButton?.href && (
              <Link href={actionButton.href} className="btn btn-primary" onClick={onClose}>
                {actionButton.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
