import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/apiService';

type FormState = {
  productName: string;
  quantity: string;
  manufacturingDate: string;
};

type Props = {
  onFormChange?: (formState: FormState) => void;
};

const ProductForm: React.FC<Props> = ({ onFormChange }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    productName: '',
    quantity: '',
    manufacturingDate: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const formStateRef = useRef(formState);
    
    useEffect(() => {
        formStateRef.current = formState;
    }, [formState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const next = { ...formState, [name]: value } as FormState;
    setFormState(next);
    setError('');
    setSuccess('');
    if (onFormChange) onFormChange(next);
  };

    const handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault();
        
        if (!formState.productName.trim()) {
            setError('Vui lòng nhập tên sản phẩm');
            return;
        }
        const qty = Number(formState.quantity);
        if (!formState.quantity || Number.isNaN(qty) || qty <= 0) {
            setError('Số lượng phải lớn hơn 0');
            return;
        }
        if (!formState.manufacturingDate) {
            setError('Vui lòng chọn ngày sản xuất');
            return;
        }

        // Tạo Snapshot Payload
        const payloadSnapshot = { 
            productName: formState.productName.trim(),
            quantity: formState.quantity, 
            manufacturingDate: formState.manufacturingDate,
        };

        setIsSubmitting(true);
        setError('');
        setSuccess('Đang ký giao dịch trên Blockchain...');
        
        try {          
            console.log('Bắt đầu giao dịch Smart Contract...');
            
            await new Promise(resolve => setTimeout(resolve, 3500)); 

            const mockTxHash = `0x${Math.random().toString(16).substring(2, 10)}${Date.now().toString(16)}`; 

            // GỌI HÀM GỬI LÊN BACKEND VÀ TRUYỀN SNAPSHOT
            const backendResponse = await sendToBackend(mockTxHash, payloadSnapshot); 
            
            const empty = { productName: '', quantity: '', manufacturingDate: '' };
            setFormState(empty);
            if (onFormChange) onFormChange(empty);
            
        } catch (err: any) {
            console.error('Lỗi tổng thể quá trình gửi:', err);
            setError(err?.message || 'Quá trình giao dịch thất bại.');
        } finally {
            setIsSubmitting(false); 
        }
    };

  const sendToBackend = useCallback(async (transactionHash: string, payloadOverride?: Partial<FormState>) => {
    const source = (payloadOverride && Object.keys(payloadOverride).length > 0) ? payloadOverride : formStateRef.current;

    const finalPayload = {
      ...source,
      quantity: Number((source as any).quantity),
      transactionHash,
      createdAt: new Date().toISOString(),
    } as any;

    console.log('sendToBackend payload:', finalPayload);

    try {
      let endpoint = '/shipments';
      const res = await api.post(endpoint, finalPayload);
      console.log('Backend response:', res);
      const msg = res?.data?.message || 'Dữ liệu đã được gửi lên backend';
      setSuccess(msg);
      return res.data;
    } catch (err: any) {
      console.error('Failed to send to backend', err?.response || err.message || err);
      const serverMsg = err?.response?.data?.message || err?.message || 'Không gửi được dữ liệu lên backend';
      setError(serverMsg);
      throw err;
    }
  }, []);

  
  useEffect(() => {

    (window as any).sendToBackend = (txHash: string, payloadOverride?: Partial<FormState>) => {
      sendToBackend(txHash, payloadOverride).catch((err) => console.error('window.sendToBackend failed', err));
    };
    return () => {
      try {
        delete (window as any).sendToBackend;
      } catch {}
    };
  }, [sendToBackend]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm sản phẩm</h3>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
          <input
            name="productName"
            value={formState.productName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2"
            placeholder="Ví dụ: Gạo jasmine"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
          <input
            name="quantity"
            type="number"
            min={1}
            value={formState.quantity}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2"
            placeholder="Số lượng"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sản xuất</label>
          <input
            name="manufacturingDate"
            type="date"
            value={formState.manufacturingDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2"
          />
        </div>

        <div className="md:col-span-3 flex items-center space-x-3 mt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Gửi
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
