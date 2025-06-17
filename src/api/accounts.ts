import api from './api';
import type {
  GetUserAccountsResponse, GetUserByIDResponse,
  CreateAccountRequest, CreateAccountResponse,
  GetAccountByIDResponse, GetAccountMembersResponse,
  AddAccountMemberRequest, SuccessResponse,
  UpdateAccountMemberRequest, RemoveAccountMemberRequest,
  GetAccountMemberCoursesResponse, GetAccountCoursesResponse,CheckAccountNameResponse, GetAccountByNameResponse,
  GetAllInvitesResponse
} from './types';

export const getUserAccounts = () => api.get<GetUserAccountsResponse>('/accounts');
export const getUserByID = (id: number) => api.get<GetUserByIDResponse>(`/accounts/${id}`);
export const createAccount = (payload: CreateAccountRequest) =>
  api.post<CreateAccountResponse>('/accounts/create', payload);
export const getAccountByID = (id: number) =>
  api.get<GetAccountByIDResponse>(`/accounts/${id}`);
export const getAccountMembers = (id: number) =>
  api.get<GetAccountMembersResponse>(`/accounts/${id}/members`);
export const addAccountMember = (payload: AddAccountMemberRequest) =>
  api.post<SuccessResponse>('/accounts/addmember', payload);
export const updateAccountMember = (payload: UpdateAccountMemberRequest) =>
  api.post<SuccessResponse>('/accounts/updatemember', payload);
export const removeAccountMember = (payload: RemoveAccountMemberRequest) =>
  api.post<SuccessResponse>('/accounts/removemember', payload);
export const getMemberCourses = (accountId: number, memberId: number) =>
  api.get<GetAccountMemberCoursesResponse>(`/accounts/${accountId}/members/${memberId}/courses`);
export const getAccountCourses = (accountId: number) =>
  api.get<GetAccountCoursesResponse>(`/accounts/${accountId}/courses`);

export const checkAccountName = (name?: string) =>
  api.get<CheckAccountNameResponse>('/accounts/checkname', { params: { name } });

export const getAccountByName = (name?: string) =>
  api.get<GetAccountByNameResponse>('/accounts/getbyname', { params: { name } });

export const getAllInvites = (accountId: number) =>
  api.get<GetAllInvitesResponse>(`/accounts/${accountId}/invites`);