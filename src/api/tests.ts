import api from './api';
import type {
  Test,
  TestQuestion,
  TestQuestionAnswer,
  GetTestByIDResponse,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  IDResponse,
  SuccessResponse,
  CreateAnswerRequest,
  UpdateAnswerRequest,
  StartAttemptRequest,
  FinishAttemptRequest,
  SetAnswerSelectionRequest,
  GetCurrentAttemptResponse,
  GetFinishedAttemptsResponse,
  GetTestPassersResponse,
} from './types';

// Tests
export const getTestInfo = (id: number) =>
  api.get<GetTestByIDResponse>(`/tests/get`, { params: { id } });

export const createTestQuestion = (payload: CreateQuestionRequest) =>
  api.post<IDResponse>(`/tests/createquestion`, payload);

export const updateTestQuestion = (payload: UpdateQuestionRequest) =>
  api.post<SuccessResponse>(`/tests/updatequestion`, payload);

export const removeTestQuestion = (id: number) =>
  api.post<SuccessResponse>(`/tests/removequestion`, { id });

export const createTestAnswer = (payload: CreateAnswerRequest) =>
  api.post<IDResponse>(`/tests/createanswer`, payload);

export const updateTestAnswer = (payload: UpdateAnswerRequest) =>
  api.post<SuccessResponse>(`/tests/updateanswer`, payload);

export const removeTestAnswer = (id: number) =>
  api.post<SuccessResponse>(`/tests/removeanswer`, { id });

// Attempts
export const getCurrentAttempt = (test_id: number) =>
  api.get<GetCurrentAttemptResponse>(`/tests/attempts/current`, { params: { test_id } });

export const getFinishedAttempts = (
  test_id: number,
  user_id?: number,
) =>
  api.get<GetFinishedAttemptsResponse>(`/tests/attempts/finished`, {
    params: { test_id, user_id },
  });

export const getTestPassers = (test_id: number) =>
  api.get<GetTestPassersResponse>(`/tests/attempts/passers`, { params: { test_id } });

export const startAttempt = (payload: StartAttemptRequest) =>
  api.post<IDResponse>(`/tests/attempts/start`, payload);

export const finishAttempt = (payload: FinishAttemptRequest) =>
  api.post<IDResponse>(`/tests/attempts/finish`, payload);

export const setAnswerSelection = (payload: SetAnswerSelectionRequest) =>
  api.post<SuccessResponse>(`/tests/attempts/selectanswer`, payload);