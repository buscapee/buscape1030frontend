import React, { useEffect } from 'react';

const notificationStyle = {
  position: 'fixed',
  right: 24,
  bottom: 24,
  background: '#fff',
  color: '#23272e',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
  padding: '10px 28px 10px 14px',
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: 16,
  zIndex: 9999,
  minWidth: 0,
  maxWidth: 420,
  gap: 10,
};

const iconStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 8,
  fontWeight: 700,
};

const colorMap = {
  success: '#22c55e', // verde
  warning: '#f59e42', // laranja
  error: '#ef4444',   // vermelho
};

export default function Notification({ message, onClose, type = 'success' }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2200);
    return () => clearTimeout(timer);
  }, [onClose]);

  const iconColor = colorMap[type] || colorMap.success;

  return (
    <div style={notificationStyle}>
      <span style={iconStyle}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={iconColor} height="20" width="20" style={{ fontWeight: 700 }}>
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"></path>
        </svg>
      </span>
      <span style={{ fontWeight: 600, fontSize: 16, color: '#23272e', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'left' }}>{message}</span>
    </div>
  );
} 