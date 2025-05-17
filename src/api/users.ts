import api from './api';
import type { GetUserByIDResponse, GetUserAccountsResponse } from './types';

// me для текущего пользователя
export const getUserByID = (id: number|string) => api.get<GetUserByIDResponse>(`/users/${id}`);
export const getUserAccounts = (id: number|string) => api.get<GetUserAccountsResponse>(`/users/${id}/accounts`);
export const getCurrentUser = () => api.get<GetUserByIDResponse>('/users/me');