// src/utils/fileHelpers.ts

export const computeFileHash = async (file: File): Promise<string> => {
  // 1. Đọc file dưới dạng ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  
  // 2. Sử dụng thuật toán SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  
  // 3. Chuyển đổi Buffer thành chuỗi Hex
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex; // Ví dụ: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
};