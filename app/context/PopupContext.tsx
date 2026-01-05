'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

type PopupType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface PopupOptions {
  title?: string;
  message: string;
  type?: PopupType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface PopupContextType {
  showPopup: (options: PopupOptions) => Promise<boolean>;
  showAlert: (message: string, type?: PopupType, title?: string) => Promise<void>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
}

const PopupContext = createContext<PopupContextType | null>(null);

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};

interface PopupState extends PopupOptions {
  isOpen: boolean;
  resolve?: (value: boolean) => void;
}

export function PopupProvider({ children }: { children: ReactNode }) {
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const showPopup = useCallback((options: PopupOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setPopup({
        ...options,
        isOpen: true,
        resolve,
      });
    });
  }, []);

  const showAlert = useCallback(async (message: string, type: PopupType = 'info', title?: string): Promise<void> => {
    await showPopup({ message, type, title, confirmText: 'OK' });
  }, [showPopup]);

  const showConfirm = useCallback((message: string, title?: string): Promise<boolean> => {
    return showPopup({
      message,
      type: 'confirm',
      title: title || 'Confirm',
      confirmText: 'Yes',
      cancelText: 'Cancel',
    });
  }, [showPopup]);

  const handleClose = (result: boolean) => {
    if (popup.resolve) {
      popup.resolve(result);
    }
    setPopup((prev) => ({ ...prev, isOpen: false }));
  };

  const getIcon = () => {
    switch (popup.type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-[#00B894]" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-[#FF7675]" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-[#FFD93D]" />;
      case 'confirm':
        return <AlertTriangle className="w-12 h-12 text-[#6C5CE7]" />;
      default:
        return <Info className="w-12 h-12 text-[#6C5CE7]" />;
    }
  };

  const getButtonColor = () => {
    switch (popup.type) {
      case 'success':
        return 'bg-[#00B894] hover:bg-[#00a884]';
      case 'error':
        return 'bg-[#FF7675] hover:bg-[#ff5f5d]';
      case 'warning':
        return 'bg-[#FFD93D] hover:bg-[#ffd020] text-black';
      case 'confirm':
        return 'bg-[#6C5CE7] hover:bg-[#5b4cdb]';
      default:
        return 'bg-black hover:bg-neutral-800';
    }
  };

  return (
    <PopupContext.Provider value={{ showPopup, showAlert, showConfirm }}>
      {children}
      <AnimatePresence>
        {popup.isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => popup.type !== 'confirm' && handleClose(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            />
            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] w-[90%] max-w-md"
            >
              <div className="bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0px_#000] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b-2 border-black/10">
                  <div className="flex items-center gap-3">
                    {getIcon()}
                    <h3 className="font-header text-xl font-black text-black">
                      {popup.title || (popup.type === 'success' ? 'Success' : popup.type === 'error' ? 'Error' : popup.type === 'warning' ? 'Warning' : popup.type === 'confirm' ? 'Confirm' : 'Notice')}
                    </h3>
                  </div>
                  {popup.type !== 'confirm' && (
                    <button
                      onClick={() => handleClose(false)}
                      className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Body */}
                <div className="p-6">
                  <p className="text-black/80 font-medium text-base leading-relaxed whitespace-pre-wrap">
                    {popup.message}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-4 border-t-2 border-black/10 bg-neutral-50">
                  {popup.type === 'confirm' && (
                    <button
                      onClick={() => handleClose(false)}
                      className="flex-1 px-6 py-3 border-2 border-black rounded-xl font-black text-sm uppercase tracking-wider hover:bg-black/5 transition-colors"
                    >
                      {popup.cancelText || 'Cancel'}
                    </button>
                  )}
                  <button
                    onClick={() => handleClose(true)}
                    className={`flex-1 px-6 py-3 border-2 border-black rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${getButtonColor()}`}
                  >
                    {popup.confirmText || 'OK'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PopupContext.Provider>
  );
}
