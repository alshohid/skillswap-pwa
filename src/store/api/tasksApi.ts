import { api } from '@/store/api/baseApi';
import { PAGE_SIZE } from '@/lib/constants';
import { normalizePaginated, unwrapTask } from '@/lib/normalize';
import { addAppliedTaskId } from '@/lib/session';
import type {
  Application,
  CompleteTaskResponse,
  Paginated,
  Task,
  TaskQueryParams,
} from '@/types/api';

function extractList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const body = (raw ?? {}) as Record<string, unknown>;
  return (body.data ?? body.items ?? body.results ?? body.applications ??
    []) as T[];
}

export const tasksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /tasks?page=&limit=&status=&search= */
    getTasks: builder.query<Paginated<Task>, TaskQueryParams | void>({
      query: (params) => {
        const { page = 1, limit = PAGE_SIZE, status, search } =
          (params ?? {}) as TaskQueryParams;
        const searchParams = new URLSearchParams();
        searchParams.set('page', String(page));
        searchParams.set('limit', String(limit));
        if (status && status !== 'ALL') searchParams.set('status', status);
        if (search?.trim()) searchParams.set('search', search.trim());
        return `/tasks?${searchParams.toString()}`;
      },
      transformResponse: (raw: unknown, _meta, arg) =>
        normalizePaginated<Task>(raw, arg?.page ?? 1, arg?.limit ?? PAGE_SIZE),
      providesTags: (result) =>
        result
          ? [
              { type: 'Tasks', id: 'LIST' },
              ...result.items.map(
                (task) => ({ type: 'Task', id: String(task.id) }) as const,
              ),
            ]
          : [{ type: 'Tasks', id: 'LIST' }],
    }),

    /** GET /tasks/:id */
    getTask: builder.query<Task, number>({
      query: (id) => `/tasks/${id}`,
      transformResponse: unwrapTask<Task>,
      providesTags: (_task, _error, id) => [{ type: 'Task', id: String(id) }],
    }),

    /** POST /tasks */
    createTask: builder.mutation<
      Task,
      { title: string; description: string; pointsOffered: number }
    >({
      query: (body) => ({ url: '/tasks', method: 'POST', body }),
      transformResponse: unwrapTask<Task>,
      invalidatesTags: [{ type: 'Tasks', id: 'LIST' }],
    }),

    /** POST /tasks/:id/applications */
    applyToTask: builder.mutation<Application, { id: number; message: string }>(
      {
        query: ({ id, message }) => ({
          url: `/tasks/${id}/applications`,
          method: 'POST',
          body: { message },
        }),
        invalidatesTags: (_res, _err, { id }) => [
          { type: 'Task', id: String(id) },
          { type: 'Applications', id: `task-${id}` },
          { type: 'Tasks', id: 'LIST' },
        ],
        // Best-effort local record powering the "Applied" tab.
        onQueryStarted: ({ id }) => addAppliedTaskId(id),
      },
    ),

    /** GET /tasks/:id/applications */
    getTaskApplications: builder.query<Application[], number>({
      query: (id) => `/tasks/${id}/applications`,
      transformResponse: extractList<Application>,
      providesTags: (_res, _error, id) => [
        { type: 'Applications', id: `task-${id}` },
      ],
    }),

    /** POST /tasks/:taskId/assign/:applicationId */
    assignApplication: builder.mutation<
      unknown,
      { taskId: number; applicationId: number }
    >({
      query: ({ taskId, applicationId }) => ({
        url: `/tasks/${taskId}/assign/${applicationId}`,
        method: 'POST',
      }),
      invalidatesTags: (_res, _err, { taskId }) => [
        { type: 'Task', id: String(taskId) },
        { type: 'Tasks', id: 'LIST' },
        { type: 'Applications', id: `task-${taskId}` },
      ],
    }),

    /**
     * POST /tasks/:id/complete — backend performs the ACID point transfer
     * and returns a receipt: { task_id, points_transferred, from_user_id, to_user_id }.
     */
    completeTask: builder.mutation<CompleteTaskResponse, number>({
      query: (id) => ({ url: `/tasks/${id}/complete`, method: 'POST' }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Task', id: String(id) },
        { type: 'Tasks', id: 'LIST' },
        { type: 'Applications', id: `task-${id}` },
        { type: 'Transactions', id: 'LIST' },
        { type: 'Balance' },
        { type: 'User' },
      ],
    }),

    /** POST /tasks/:id/cancel */
    cancelTask: builder.mutation<Task, number>({
      query: (id) => ({ url: `/tasks/${id}/cancel`, method: 'POST' }),
      transformResponse: unwrapTask<Task>,
      invalidatesTags: (_res, _err, id) => [
        { type: 'Task', id: String(id) },
        { type: 'Tasks', id: 'LIST' },
        { type: 'Applications', id: `task-${id}` },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useApplyToTaskMutation,
  useGetTaskApplicationsQuery,
  useAssignApplicationMutation,
  useCompleteTaskMutation,
  useCancelTaskMutation,
} = tasksApi;
