import api from './api';
import type {
  SendCodeRequest, SendCodeResponse, SignUpRequest, SignUpResponse,
  SignInRequest, SignInResponse, RefreshSessionRequest, RefreshSessionResponse,
  CheckEmailResponse
} from './types';

export const sendCode = (payload: SendCodeRequest) =>
  api.post<SendCodeResponse>('/auth/sendcode', payload);

export const signUp = (payload: SignUpRequest) =>
  api.post<SignUpResponse>('/auth/signup', payload);

export const signIn = (payload: SignInRequest) =>
  api.post<SignInResponse>('/auth/signin', payload);

export const refreshSession = (payload: RefreshSessionRequest) =>
  api.post<RefreshSessionResponse>('/auth/refresh', payload);

export const checkEmail = (email?: string) =>
  api.get<CheckEmailResponse>('/auth/checkemail', { params: { email } });

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};