import api from './api';
import type {
  CreateBlockRequest, CreateBlockResponse,
  UpdateBlockRequest, SuccessResponse, RemoveBlockRequest,
  UpdateBlockOrderRequest,
  GetBlockByIDResponse
} from './types';

export const createBlock = (payload: CreateBlockRequest) => api.post<CreateBlockResponse>('/blocks/create', payload);
export const updateBlock = (payload: UpdateBlockRequest) => api.post<SuccessResponse>('/blocks/update', payload);
export const removeBlock = (payload: RemoveBlockRequest) => api.post<SuccessResponse>('/blocks/remove', payload);
export const setBlockPosition = (payload: UpdateBlockOrderRequest) => api.post<SuccessResponse>('/blocks/setpos', payload);
export const getBlockByID = (id: number) => api.get<GetBlockByIDResponse>(`/lessons/${id}`);