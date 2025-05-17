import api from './api';
import type { UploadFileResponse } from './types';

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<UploadFileResponse>('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const downloadFile = (id: number) =>
  api.get<Blob>(`/files/${id}`, { responseType: 'blob' });