import api from "./api";
import type { AcceptInviteRequest, RemoveInviteRequest, SendInviteRequest, SuccessResponse } from "./types";

export const sendInvite = (payload: SendInviteRequest) => api.post<SuccessResponse>('/invites/send', payload);
export const removeInvite = (payload: RemoveInviteRequest) => api.post<SuccessResponse>('/invites/remove', payload);
export const acceptInvite = (payload: AcceptInviteRequest) => api.post<SuccessResponse>('/invites/accept', payload);