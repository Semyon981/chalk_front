import api from './api';
import type {
  CreateModuleRequest, CreateModuleResponse,
  UpdateModuleRequest, SuccessResponse, RemoveModuleRequest,
  UpdateModuleOrderRequest, GetModuleByIDResponse,
  GetLessonsByModuleIDResponse
} from './types';

export const createModule = (payload: CreateModuleRequest) => api.post<CreateModuleResponse>('/modules/create', payload);
export const updateModule = (payload: UpdateModuleRequest) => api.post<SuccessResponse>('/modules/update', payload);
export const removeModule = (payload: RemoveModuleRequest) => api.post<SuccessResponse>('/modules/remove', payload);
export const setModulePosition = (payload: UpdateModuleOrderRequest) => api.post<SuccessResponse>('/modules/setpos', payload);
export const getModuleByID = (id: number) => api.get<GetModuleByIDResponse>(`/modules/${id}`);
export const getLessonsByModuleID = (id: number) => api.get<GetLessonsByModuleIDResponse>(`/modules/${id}/lessons`);