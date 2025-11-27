import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, X, ExternalLink } from 'lucide-react';

export type ToastType = 'pending' | 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  txHash?: string; 
}

export const ToastNotification: React.FC<ToastProps> = ({ message, type, isVisible, onClose, txHash }) => {
  
  // Tự động tắt 5s trừ pending
  useEffect(() => {
    if (isVisible && type !== 'pending') {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, type, onClose]);

  if (!isVisible) return null;


  const config = {
    pending: {
      icon: <Loader2 className="w-5 h-5 animate-spin text-blue-600" />,
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-800",
      title: "Đang xử lý..."
    },
    success: {
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      bg: "bg-green-50 border-green-200",
      text: "text-green-800",
      title: "Thành công!"
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      bg: "bg-red-50 border-red-200",
      text: "text-red-800",
      title: "Gặp lỗi!"
    }
  };

  const style = config[type];

  return (
    <div className="fixed top-20 right-5 z-[9999] animate-in slide-in-from-right fade-in duration-300">
      <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-xl max-w-sm w-80 ${style.bg}`}>
        <div className="flex-shrink-0 mt-0.5">
          {style.icon}
        </div>
        
        <div className="flex-1">
          <h3 className={`text-sm font-bold ${style.text}`}>{style.title}</h3>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{message}</p>
          
          {/* hiện link poly */}
          {txHash && (
            <a 
              href={`https://amoy.polygonscan.com/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[10px] text-blue-500 underline mt-2 hover:text-blue-700"
            >
              Xem trên PolygonScan <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};