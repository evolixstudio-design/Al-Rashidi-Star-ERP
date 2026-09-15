import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalOverlayProps {
  children: React.ReactNode;
  onClose?: () => void;
  isOpen?: boolean;
}

export function ModalOverlay({ children, onClose, isOpen = true }: ModalOverlayProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full flex justify-center max-w-full">
        {children}
      </div>
    </div>,
    document.body
  );
}
