import React from 'react';

interface AlertModalProps {
  show: boolean;
  title: string;
  message: string;
  onClose: () => void;
  variant?: 'success' | 'error' | 'warning' | 'info';
}

export default function AlertModal({
  show,
  title,
  message,
  onClose,
  variant = 'info',
}: AlertModalProps) {
  if (!show) return null;

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
              <p style={{ marginBottom: 0, fontSize: '16px' }}>{message}</p>
            </div>
          </div>
          <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6' }}>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

