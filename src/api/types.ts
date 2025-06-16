export interface ApiResponse<T> {
  data: T;
}

// Auth
export interface SendCodeRequest { email: string; }
export interface SendCodeResponse { code_id: string; }
export interface SignUpRequest { code_id: string; code: string; name: string; password: string; }
export interface SignUpResponse { user_id: number; }
export interface SignInRequest { email: string; password: string; }
export interface SignInResponse { session_id: number; access_token: string; refresh_token: string; }
export interface RefreshSessionRequest { refresh_token: string; }
export interface RefreshSessionResponse { session_id: number; access_token: string; refresh_token: string; }
export interface CheckEmailResponse { assigned: boolean; }
export interface CheckAccountNameResponse { assigned: boolean; }

// Users
export interface GetUserAccountsResponse { accounts: Account[]; }
export interface GetUserByIDResponse { user: User; }

// Account
export interface Account { id: number; name: string; }
export interface User { id: number; name: string; email: string; }
export type AccountMemberRole = 'owner' | 'admin' | 'member';
export interface AccountMember { user: User; role: AccountMemberRole; }
export interface CreateAccountRequest { name: string; }
export interface CreateAccountResponse { account: Account; }
export interface GetAccountByIDResponse { account: Account; }
export interface GetAccountByNameResponse { account: Account; }
export interface GetAccountMembersResponse { members: AccountMember[]; }
export interface AddAccountMemberRequest { id: number; user_id: number; role: AccountMemberRole; }
export interface SuccessResponse { success: boolean; }
export interface GetAccountMemberCoursesResponse { courses: Course[]; }
export interface GetAccountCoursesResponse { courses: Course[]; }
export interface UpdateAccountMemberRequest { account_id: number; user_id: number; role: AccountMemberRole; }
export interface RemoveAccountMemberRequest { account_id: number; user_id: number; }
export interface Invite { id: number, email: string, account_id: number, created: string }
export interface GetAllInvitesResponse { invites: Invite[] }

// Course
export interface Course { id: number; account_id: number; name: string; }
export interface CreateCourseRequest { account_id: number; name: string; }
export interface CreateCourseResponse { id: number; }
export interface GetCourseByIDResponse { course: Course; }
export interface EnrollUserRequest { id: number; user_id: number; }
export interface RemoveCourseRequest { id: number; }
export interface RemoveCourseResponse { success: boolean; }
export interface GetCourseParticipantsResponse { participants: AccountMember[]; }
export interface UpdateCourseRequest { id: number; name: string; }
export interface UpdateCourseResponse { success: boolean; }
export interface GetModulesByCourseIDResponse { modules: Module[]; }

// Module
export interface Module { id: number; course_id: number; order_idx: number; name: string; }
export interface CreateModuleRequest { course_id: number; name: string; order_idx?: number; }
export interface CreateModuleResponse { id: number; }
export interface UpdateModuleRequest { id: number; name: string; }
export interface RemoveModuleRequest { id: number; }
export interface UpdateModuleOrderRequest { id: number; order_idx: number; }
export interface UpdateModuleOrderResponse { success: boolean; }
export interface GetModuleByIDResponse { module: Module; }
export interface GetLessonsByModuleIDResponse { lessons: Lesson[]; }

// Lesson
export interface Lesson { id: number; module_id: number; order_idx: number; name: string; }
export interface CreateLessonRequest { module_id: number; name: string; order_idx?: number; }
export interface CreateLessonResponse { id: number; }
export interface UpdateLessonRequest { id: number; name: string; }
export interface UpdateLessonOrderRequest { id: number; order_idx: number; }
export interface RemoveLessonRequest { id: number; }
export interface GetLessonByIDResponse { lesson: Lesson; }
export interface GetBlocksByLessonIDResponse { blocks: Block[]; }

// Block
export type BlockType = 'text' | 'video' | 'test';
export interface Block { id: number; lesson_id: number; order_idx: number; type: BlockType; content?: string; file_id?: number; }
export interface CreateBlockRequest { lesson_id: number; type: BlockType; content?: string; file_id?: number; order_idx?: number; }
export interface CreateBlockResponse { id: number; }
export interface UpdateBlockRequest { id: number; content?: string; file_id?: number; }
export interface UpdateBlockOrderRequest { id: number; order_idx: number; }
export interface RemoveBlockRequest { id: number; }

// File
export interface UploadFileResponse { id: number; uploader_user_id: number; name: string; content_type: string; size: number; uploaded_at: string; }

// Invites
export interface SendInviteRequest { account_id: number; email: string; callback_url: string; }
export interface RemoveInviteRequest { id: number; }
export interface AcceptInviteRequest { key: string; }

// Tests

export interface IDResponse {
  id: number;
}

export interface IDRequest {
  id: number;
}
export interface Test {
  id: number;
  questions: TestQuestion[];
}

export interface TestQuestion {
  id: number;
  question: string;
  answers: TestQuestionAnswer[];
}

export interface TestQuestionAnswer {
  id: number;
  answer: string;
  is_correct: boolean;
}

export interface GetTestByIDResponse {
  test: Test;
}

// Reuses existing SuccessResponse: export interface SuccessResponse { success: boolean; }

export interface CreateQuestionRequest {
  test_id: number;
  question: string;
}

export interface UpdateQuestionRequest {
  id: number;
  question: string;
}

export interface CreateAnswerRequest {
  question_id: number;
  answer: string;
  is_correct: boolean;
}

export interface UpdateAnswerRequest {
  id: number;
  answer?: string;
  is_correct?: boolean;
}


// Test attempts

export interface Attempt {
  id: number;
  user_id: number;
  started_at: string;      // ISO 8601 timestamp
  finished_at?: string;    // ISO 8601 timestamp or undefined
  points?: number;
  questions: AttemptQuestion[];
}

export interface AttemptQuestion {
  id: number;
  question: string;
  answers: AttemptQuestionAnswer[];
}

export interface AttemptQuestionAnswer {
  id: number;
  answer: string;
  is_selected: boolean;
  is_correct?: boolean;
}

export interface StartAttemptRequest {
  test_id: number;
}

export interface FinishAttemptRequest {
  id: number;
}

export interface SetAnswerSelectionRequest {
  attempt_answer_id: number;
  is_selected: boolean;
}

export interface GetCurrentAttemptResponse {
  attempt: Attempt;
}

export interface GetFinishedAttemptsResponse {
  attempts: Attempt[];
}

export interface TestPasser {
  user_id: number;
  name: string;
  email: string;
  attempts_count: number;
}

export interface GetTestPassersResponse {
  passers: TestPasser[];
}
