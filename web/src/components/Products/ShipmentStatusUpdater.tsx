import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { callUpdateStatus, ShipmentStatus } from '../../services/blockchainService';
import { RefreshCw, Truck, PackageCheck, ShieldCheck, Tag, Edit, X, Check, Copy } from 'lucide-react';
import axios from "axios";
import { useToast } from '../context/ToastContext';

interface Props {
  shipmentId: string | number;
  currentStatus: string;
  onStatusUpdated?: () => void;
}

export const ShipmentStatusUpdater: React.FC<Props> = ({ shipmentId, currentStatus, onStatusUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const STATUS_ORDER = ['CREATED', 'SHIPPED', 'RECEIVED', 'AUDITED', 'FOR_SALE'];
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [successHash, setSuccessHash] = useState('');
  const [copied, setCopied] = useState(false);

  // 🔹 state cho modal xác nhận
  const [pendingAction, setPendingAction] = useState<{
    statusEnum: number;
    statusName: string;
  } | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedButton = menuButtonRef.current && menuButtonRef.current.contains(target as Node);
      const clickedMenu = menuContainerRef.current && menuContainerRef.current.contains(target as Node);
      if (!clickedButton && !clickedMenu) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(successHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdate = async (newStatusEnum: number, statusName: string) => {
    setIsOpen(false);

    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    const nextIndex = STATUS_ORDER.indexOf(statusName);

    if (nextIndex !== currentIndex + 1) {
      const allowedNext = STATUS_ORDER[currentIndex + 1];
      showToast(
        `Sai quy trình. Trạng thái tiếp theo hợp lệ là: ${allowedNext}`,
        "error"
      );
      return;
    }

    showToast("Đang mở ví MetaMask...", "pending");

    setLoading(true);
    setSuccessHash('');

    try {

      const tx = await callUpdateStatus(shipmentId, newStatusEnum);

      showToast("Giao dịch đã gửi! Đang chờ xác nhận trên Blockchain...", "pending", tx.hash);

      // backend
      await axios.patch(`${import.meta.env.VITE_API_URL}/shipments/:id/status`, {
        shipmentId,
        newStatus: statusName,
        transactionHash: tx.hash
      });

      setSuccessHash(tx.hash);


      showToast(`Cập nhật ${statusName} thành công!`, "success", tx.hash);

      if (onStatusUpdated) onStatusUpdated();

    } catch (err: any) {
      console.error(err);

      let msg = err.message || "Có lỗi xảy ra.";
      if (msg.includes("rejected")) msg = "Bạn đã từ chối giao dịch.";
      if (msg.includes("Not producer")) msg = "Bạn không có quyền sửa lô hàng này.";

      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center text-blue-600 text-xs animate-pulse">
        <RefreshCw className="animate-spin h-3 w-3 mr-1" />
        Đang xử lý...
      </div>
    );
  }

  if (successHash) {
    return (
      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg animate-in fade-in zoom-in duration-300 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-green-700 flex items-center gap-1">
            <Check className="w-3 h-3" /> Thành công!
          </span>
          <button onClick={() => setSuccessHash('')}><X className="w-3 h-3 text-gray-400 hover:text-gray-600" /></button>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded border border-gray-300 mb-1">
          <code className="text-[10px] text-gray-800 font-mono truncate flex-1" title={successHash}>
            {successHash}
          </code>
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-gray-100 rounded text-blue-600 transition-colors"
            title="Copy Hash"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          ref={(el) => (menuButtonRef.current = el)}
          onClick={(e) => {
            e.stopPropagation();
            if (!isOpen) {
              const rect = menuButtonRef.current?.getBoundingClientRect();
              const MENU_WIDTH = 192; // matches w-48
              if (rect) {
                let left = rect.right - MENU_WIDTH;
                if (left < 8) left = rect.left;
                if (left + MENU_WIDTH > window.innerWidth - 8) left = window.innerWidth - MENU_WIDTH - 8;
                setMenuPos({ top: rect.bottom + 8, left });
              } else {
                setMenuPos(null);
              }
            }
            setIsOpen((v) => !v);
          }}
          className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          title="Cập nhật trạng thái"
        >
          <Edit className="w-4 h-4" />
        </button>

        {isOpen &&
          createPortal(
            <div
              ref={(el) => (menuContainerRef.current = el)}
              style={{
                position: 'fixed',
                top: menuPos?.top ?? 0,
                left: menuPos?.left ?? 0,
                width: 192,
                zIndex: 99999,
              }}
            >
              <div className="w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                <div className="p-2 bg-gray-50 border-b border-gray-200 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Chọn hành động
                </div>
                <div className="py-1">
                  <button
                    onClick={() =>
                      setPendingAction({
                        statusEnum: ShipmentStatus.SHIPPED,
                        statusName: 'SHIPPED',
                      })
                    }
                    disabled={currentStatus === 'SHIPPED'}
                    className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-3 hover:bg-blue-50 transition-colors
                    ${currentStatus === 'SHIPPED' ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-gray-700'}
                  `}
                  >
                    <Truck className={`w-4 h-4 ${currentStatus === 'SHIPPED' ? 'text-gray-400' : 'text-yellow-600'}`} />
                    <span>Giao hàng (Ship)</span>
                    {currentStatus === 'SHIPPED' && <Check className="w-3 h-3 ml-auto" />}
                  </button>

                  <button
                    onClick={() =>
                      setPendingAction({
                        statusEnum: ShipmentStatus.RECEIVED,
                        statusName: 'RECEIVED',
                      })
                    }
                    disabled={currentStatus === 'RECEIVED'}
                    className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-3 hover:bg-blue-50 transition-colors
                    ${currentStatus === 'RECEIVED' ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-gray-700'}
                  `}
                  >
                    <PackageCheck className={`w-4 h-4 ${currentStatus === 'RECEIVED' ? 'text-gray-400' : 'text-purple-600'}`} />
                    <span>Đã nhận (Receive)</span>
                    {currentStatus === 'RECEIVED' && <Check className="w-3 h-3 ml-auto" />}
                  </button>

                  <button
                    onClick={() =>
                      setPendingAction({
                        statusEnum: ShipmentStatus.AUDITED,
                        statusName: 'AUDITED',
                      })
                    }
                    disabled={currentStatus === 'AUDITED'}
                    className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-3 hover:bg-blue-50 transition-colors
                    ${currentStatus === 'AUDITED' ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-gray-700'}
                  `}
                  >
                    <ShieldCheck className={`w-4 h-4 ${currentStatus === 'AUDITED' ? 'text-gray-400' : 'text-indigo-600'}`} />
                    <span>Kiểm định (Audit)</span>
                    {currentStatus === 'AUDITED' && <Check className="w-3 h-3 ml-auto" />}
                  </button>

                  <button
                    onClick={() =>
                      setPendingAction({
                        statusEnum: ShipmentStatus.FOR_SALE,
                        statusName: 'FOR_SALE',
                      })
                    }
                    disabled={currentStatus === 'FOR_SALE'}
                    className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-3 hover:bg-blue-50 transition-colors
                    ${currentStatus === 'FOR_SALE' ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-gray-700'}
                  `}
                  >
                    <Tag className={`w-4 h-4 ${currentStatus === 'FOR_SALE' ? 'text-gray-400' : 'text-green-600'}`} />
                    <span>Bán hàng (Sell)</span>
                    {currentStatus === 'FOR_SALE' && <Check className="w-3 h-3 ml-auto" />}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
      {
        pendingAction && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-96 p-4">
              <h3 className="text-sm font-semibold mb-2">
                Xác nhận thay đổi trạng thái
              </h3>

              <p className="text-xs text-gray-600 mb-4">
                Bạn có chắc muốn đổi trạng thái thành{' '}
                <b>{pendingAction.statusName}</b> không?
              </p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setPendingAction(null)}
                  className="px-3 py-1.5 text-xs rounded border"
                >
                  Huỷ
                </button>

                <button
                  onClick={() => {
                    handleUpdate(
                      pendingAction.statusEnum,
                      pendingAction.statusName
                    );
                    setPendingAction(null);
                  }}
                  className="px-3 py-1.5 text-xs rounded bg-blue-600 text-white"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
};