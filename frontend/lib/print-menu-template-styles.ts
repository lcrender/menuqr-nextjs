/** Estilos de variantes de plantilla — inyectados en la página de impresión (evita caché del CSS estático). */
export const PRINT_MENU_TEMPLATE_STYLES = `
.print-menu-sheet[data-print-template="elegant"] {
  font-family: Georgia, 'Times New Roman', Times, serif;
  padding: 2.5rem 2.75rem;
}
.print-menu-sheet[data-print-template="elegant"] .print-menu-header {
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-bottom: none;
  padding-bottom: 0.5rem;
  margin-bottom: 2rem;
}
.print-menu-sheet[data-print-template="elegant"] .print-menu-header::after {
  content: '';
  display: block;
  width: 120px;
  height: 2px;
  background: #1a1a1a;
  margin-top: 1rem;
}
.print-menu-sheet[data-print-template="elegant"] .print-menu-logo {
  width: 88px;
  height: 88px;
  border-radius: 50%;
}
.print-menu-sheet[data-print-template="elegant"] .print-menu-title {
  font-size: 2rem;
  font-weight: 400;
  letter-spacing: 0.02em;
}
.print-menu-sheet[data-print-template="elegant"] .print-menu-desc {
  font-style: italic;
  max-width: 520px;
  margin: 0 auto;
}
.print-menu-sheet[data-print-template="elegant"] .print-menu-name {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 400;
  border-bottom: none;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 1.25rem;
}
.print-menu-sheet[data-print-template="elegant"] .print-menu-menu-desc {
  text-align: center;
  font-style: italic;
}
.print-menu-sheet[data-print-template="elegant"] .print-menu-section-title {
  text-align: center;
  text-transform: none;
  font-size: 1.15rem;
  font-weight: 400;
  letter-spacing: 0.08em;
  font-variant: small-caps;
  border-bottom: 1px solid #ccc;
  padding-bottom: 0.35rem;
  margin-bottom: 0.85rem;
}
.print-menu-sheet[data-print-template="elegant"] .print-menu-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.5rem 1rem;
  align-items: start;
  border-bottom: 1px dotted #c8c8c8;
  padding: 0.4rem 0;
}
.print-menu-sheet[data-print-template="elegant"] .print-menu-item-name {
  font-weight: 400;
  font-size: 1rem;
}
.print-menu-sheet[data-print-template="elegant"] .print-menu-item-desc {
  font-size: 0.82rem;
  font-style: italic;
}
.print-menu-sheet[data-print-template="elegant"] .print-menu-item-prices {
  text-align: right;
  align-self: start;
  padding-top: 0.05rem;
}
.print-menu-sheet[data-print-template="elegant"] .print-menu-footer {
  text-align: center;
  border-top: 1px solid #ccc;
}

.print-menu-sheet[data-print-template="modern"] {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  padding: 0;
  overflow: hidden;
  border-radius: 8px;
}
.print-menu-sheet[data-print-template="modern"] .print-menu-cover {
  border-radius: 0;
  margin-bottom: 0;
  max-height: 200px;
}
.print-menu-sheet[data-print-template="modern"] .print-menu-header {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: #fff;
  margin: 0;
  padding: 1.75rem 2rem;
  border-bottom: none;
  align-items: center;
}
.print-menu-sheet[data-print-template="modern"] .print-menu-title {
  color: #fff;
  font-size: 1.65rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.print-menu-sheet[data-print-template="modern"] .print-menu-desc {
  color: rgba(255, 255, 255, 0.85);
}
.print-menu-sheet[data-print-template="modern"] .print-menu-logo {
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.35);
}
.print-menu-sheet[data-print-template="modern"] .print-menu-block {
  padding: 0 2rem;
  margin-top: 1.75rem;
}
.print-menu-sheet[data-print-template="modern"] .print-menu-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  border-bottom: 3px solid #3b82f6;
  display: inline-block;
  padding-bottom: 0.25rem;
  margin-bottom: 0.75rem;
}
.print-menu-sheet[data-print-template="modern"] .print-menu-section-title {
  text-transform: none;
  letter-spacing: 0.02em;
  font-size: 0.95rem;
  color: #3b82f6;
  margin-bottom: 0.75rem;
  padding-left: 0.75rem;
  border-left: 4px solid #3b82f6;
}
.print-menu-sheet[data-print-template="modern"] .print-menu-item {
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 0.65rem 0.75rem;
  margin-bottom: 0.35rem;
  border-bottom: none;
  background: #f8fafc;
  border-radius: 6px;
}
.print-menu-sheet[data-print-template="modern"] .print-menu-section .print-menu-item:nth-of-type(even) {
  background: #f1f5f9;
}
.print-menu-sheet[data-print-template="modern"] .print-menu-item-name {
  font-size: 0.92rem;
  font-weight: 600;
  color: #0f172a;
}
.print-menu-sheet[data-print-template="modern"] .print-menu-item-desc {
  font-size: 0.78rem;
  color: #64748b;
}
.print-menu-sheet[data-print-template="modern"] .print-menu-item-prices {
  color: #1e293b;
  font-size: 0.88rem;
}
.print-menu-sheet[data-print-template="modern"] .print-menu-footer {
  margin: 2rem 0 0;
  padding: 1.25rem 2rem 1.75rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}
.print-menu-sheet[data-print-template="modern"] .print-menu-footer h4 {
  color: #1e293b;
  font-weight: 700;
}
.print-menu-sheet[data-print-template="modern"] .print-menu-block:first-child {
  margin-top: 1.75rem;
}

.print-menu-sheet[data-print-template="bistro"] {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: #faf6f0;
  color: #3d2c1e;
  padding: 2rem 2.25rem;
}
.print-menu-sheet[data-print-template="bistro"] .print-menu-cover {
  border-radius: 2px;
  border: 3px solid #8b6914;
}
.print-menu-sheet[data-print-template="bistro"] .print-menu-header {
  border-bottom: 2px double #8b6914;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.print-menu-sheet[data-print-template="bistro"] .print-menu-logo {
  border-radius: 4px;
  border: 2px solid #c4a35a;
}
.print-menu-sheet[data-print-template="bistro"] .print-menu-title {
  font-size: 1.85rem;
  font-weight: 700;
  color: #5c3d1e;
  font-style: italic;
}
.print-menu-sheet[data-print-template="bistro"] .print-menu-desc {
  color: #6b5344;
  font-size: 0.9rem;
}
.print-menu-sheet[data-print-template="bistro"] .print-menu-name {
  color: #5c3d1e;
  font-size: 1.25rem;
  font-weight: 700;
  border-bottom: 1px dashed #c4a35a;
  text-align: center;
}
.print-menu-sheet[data-print-template="bistro"] .print-menu-section-title {
  text-transform: none;
  font-size: 1.1rem;
  font-weight: 700;
  font-style: italic;
  color: #8b6914;
  letter-spacing: 0.03em;
  margin-bottom: 0.75rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid #e8dcc8;
}
.print-menu-sheet[data-print-template="bistro"] .print-menu-item {
  display: block;
  border-bottom: 1px solid #e8dcc8;
  padding: 0.55rem 0 0.65rem;
}
.print-menu-sheet[data-print-template="bistro"] .print-menu-item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #3d2c1e;
}
.print-menu-sheet[data-print-template="bistro"] .print-menu-item-desc {
  font-size: 0.82rem;
  color: #7a6555;
  margin-top: 0.2rem;
}
.print-menu-sheet[data-print-template="bistro"] .print-menu-item-prices {
  text-align: left;
  margin-top: 0.35rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #8b6914;
  white-space: normal;
}
.print-menu-sheet[data-print-template="bistro"] .print-menu-item-price-label {
  color: #9a8068;
}
.print-menu-sheet[data-print-template="bistro"] .print-menu-footer {
  border-top: 2px double #8b6914;
  color: #5c3d1e;
  text-align: center;
}
.print-menu-sheet[data-print-template="bistro"] .print-menu-footer h4 {
  font-style: italic;
  color: #5c3d1e;
}

@media print {
  .print-menu-sheet[data-print-template="modern"] {
    border-radius: 0;
  }
  .print-menu-sheet[data-print-template="modern"] .print-menu-header,
  .print-menu-sheet[data-print-template="modern"] .print-menu-item,
  .print-menu-sheet[data-print-template="modern"] .print-menu-section .print-menu-item:nth-of-type(even),
  .print-menu-sheet[data-print-template="modern"] .print-menu-footer,
  .print-menu-sheet[data-print-template="bistro"] {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;
