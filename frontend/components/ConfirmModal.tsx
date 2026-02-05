import React from 'react';

interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'primary';
}

export default function ConfirmModal({
  show,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmModalProps) {
  if (!show) return null;

  const variantStyles = {
    danger: {
      icon: 'bi-exclamation-triangle-fill',
      iconColor: '#dc3545',
      titleColor: '#721c24',
      buttonClass: 'btn-danger',
    },
    warning: {
      icon: 'bi-exclamation-triangle-fill',
      iconColor: '#ffc107',
      titleColor: '#856404',
      buttonClass: 'btn-warning',
    },
    primary: {
      icon: 'bi-info-circle-fill',
      iconColor: '#0d6efd',
      titleColor: '#084298',
      buttonClass: 'btn-primary',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className="modal show"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
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
              onClick={onCancel}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body" style={{ padding: '24px' }}>
            <p style={{ marginBottom: 0, fontSize: '16px' }}>{message}</p>
          </div>
          <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6' }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              {cancelText}
            </button>
            <button type="button" className={`btn ${style.buttonClass}`} onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

