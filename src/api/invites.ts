import api from "./api";
import type { RemoveInviteRequest, SendInviteRequest, SuccessResponse } from "./types";

export const sendInvite = (payload: SendInviteRequest) => api.post<SuccessResponse>('/invites/send', payload);
export const removeInvite = (payload: RemoveInviteRequest) => api.post<SuccessResponse>('/invites/remove', payload);