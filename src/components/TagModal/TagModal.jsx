import React from 'react';

const TagModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
        <button 
          onClick={onClose} 
          className="absolute -top-5 -right-5 w-10 h-10 bg-white border border-gray-300 rounded-full shadow-lg flex items-center justify-center text-3xl text-gray-700 hover:text-red-600 hover:border-red-400 transition-all duration-150 z-10 focus:outline-none"
          aria-label="Fechar"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default TagModal;
