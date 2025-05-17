import api from './api';
import type {
  CreateLessonRequest, CreateLessonResponse,
  UpdateLessonRequest, SuccessResponse, RemoveLessonRequest,
  UpdateLessonOrderRequest, GetLessonByIDResponse,
  GetBlocksByLessonIDResponse
} from './types';

export const createLesson = (payload: CreateLessonRequest) => api.post<CreateLessonResponse>('/lessons/create', payload);
export const updateLesson = (payload: UpdateLessonRequest) => api.post<SuccessResponse>('/lessons/update', payload);
export const removeLesson = (payload: RemoveLessonRequest) => api.post<SuccessResponse>('/lessons/remove', payload);
export const setLessonPosition = (payload: UpdateLessonOrderRequest) => api.post<SuccessResponse>('/lessons/setpos', payload);
export const getLessonByID = (id: number) => api.get<GetLessonByIDResponse>(`/lessons/${id}`);
export const getBlocksByLessonID = (id: number) => api.get<GetBlocksByLessonIDResponse>(`/lessons/${id}/blocks`);