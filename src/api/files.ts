import api from './api';
import type { UploadFileResponse } from './types';
import { type AxiosProgressEvent } from 'axios';

export const uploadFile = (
  file: File,
  options?: {
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
    signal?: AbortSignal;
  }
) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post<UploadFileResponse>('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: options?.onUploadProgress,
    signal: options?.signal,
  });
};


export const downloadFile = (id: number) =>
  api.get<Blob>(`/files/${id}`, { responseType: 'blob' });


export const getFileUrl = (id: number)=>{
  return `${api.defaults.baseURL}/files/${id}`
}
