import api from './api';
import type {
  Course, CreateCourseRequest, CreateCourseResponse,
  GetCourseByIDResponse, EnrollUserRequest, SuccessResponse,
  UpdateCourseRequest, UpdateCourseResponse, RemoveCourseRequest,
  GetCourseParticipantsResponse, GetModulesByCourseIDResponse, RemoveCourseResponse
} from './types';

export const createCourse = (payload: CreateCourseRequest) => api.post<CreateCourseResponse>('/courses/create', payload);
export const getCourseByID = (id: number) => api.get<GetCourseByIDResponse>(`/courses/${id}`);
export const enrollUser = (payload: EnrollUserRequest) => api.post<SuccessResponse>('/courses/enroll', payload);
export const unenrollUser = (payload: EnrollUserRequest) => api.post<SuccessResponse>('/courses/unenroll', payload);
export const updateCourse = (payload: UpdateCourseRequest) => api.post<UpdateCourseResponse>('/courses/update', payload);
export const removeCourse = (payload: RemoveCourseRequest) => api.post<RemoveCourseResponse>('/courses/remove', payload);
export const getCourseParticipants = (id: number) => api.get<GetCourseParticipantsResponse>(`/courses/${id}/participants`);
export const getModulesByCourseID = (id: number) => api.get<GetModulesByCourseIDResponse>(`/courses/${id}/modules`);