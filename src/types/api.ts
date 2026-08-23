/**
 * API contract types — mirror the SkillSwap NestJS backend.
 *
 * NOTE: the backend serialises entities with snake_case column names
 * (e.g. `points_offered`) while request DTOs use camelCase
 * (e.g. `pointsOffered`, `fullName`). These types reflect that.
 */

export type TaskStatus = 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface User {
  id: number;
  full_name: string;
  email: string;
  skill_points: number;
  created_at?: string;
  bio?: string | null;
}


export type PublicUser = Pick<
  User,
  'id' | 'email' | 'full_name'
>;

export interface Task {
  id: number;
  title: string;
  description: string;
  points_offered: number;
  status: TaskStatus;
  creator_id: number;
  assignee_id: number | null;
  created_at: string;
  updated_at?: string;
  /** Included when the backend expands relations; optional for safety. */
  creator?: PublicUser | null;
  assignee?: PublicUser | null;
  /** Optional free-form checklist rendered on the details page when present. */
  requirements?: string[] | null;
}

export interface Application {
  id: number;
  task_id: number;
  applicant_id: number;
  message: string;
  status: ApplicationStatus;
  created_at: string;
  applicant?: PublicUser | null;
  task?: Task | null;
}

export interface Transaction {
  id: number;
  from_user_id: number;
  to_user_id: number;
  task_id: number | null;
  amount: number;
  type?: 'CREDIT' | 'DEBIT';
  description?: string | null;
  created_at: string;
  task?: { id: number; title: string } | null;
  from_user?: PublicUser | null;
  to_user?: PublicUser | null;
}

/** Response of POST /tasks/:id/complete (ACID point transfer receipt). */
export interface CompleteTaskResponse {
  task_id: number;
  points_transferred: number;
  from_user_id: number;
  to_user_id: number;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    user: {
      id: number;
      full_name: string;
      email: string;
      skill_points: number;
    };
  };
}

/** Normalised pagination envelope used across list endpoints. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface TaskQueryParams extends PaginationParams {
  /** `ALL` is a UI-only value and is stripped before the request. */
  status?: TaskStatus | 'ALL';
  search?: string;
}
