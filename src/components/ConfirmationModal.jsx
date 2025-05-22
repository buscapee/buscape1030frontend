import React from 'react';

const ConfirmationModal = ({ open, title, message, onConfirm, onCancel, confirmText = 'Excluir', cancelText = 'Cancelar' }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '36px 36px 28px 36px', width: '100%', maxWidth: 500, boxShadow: '0 8px 32px #0002', textAlign: 'center', fontFamily: 'inherit', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 16, color: '#222', width: '100%', textAlign: 'center' }}>{title}</h2>
        <p style={{ marginBottom: 32, fontSize: 17, color: '#222', lineHeight: 1.6, width: '100%', textAlign: 'center', wordBreak: 'break-word' }}>
          {message.split('"').map((part, idx) =>
            idx % 2 === 1 ? <b key={idx} style={{ fontWeight: 700 }}>{part}</b> : part
          )}
        </p>
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center', width: '100%', marginTop: 8 }}>
          <button
            onClick={onConfirm}
            style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 38px', fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 2px #0001', transition: 'background 0.2s' }}
          >
            {confirmText}
          </button>
          {cancelText && (
          <button
            onClick={onCancel}
            style={{ background: '#e5e7eb', color: '#6b7280', border: 'none', borderRadius: 6, padding: '12px 38px', fontWeight: 500, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 2px #0001', transition: 'background 0.2s' }}
          >
            {cancelText}
          </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 