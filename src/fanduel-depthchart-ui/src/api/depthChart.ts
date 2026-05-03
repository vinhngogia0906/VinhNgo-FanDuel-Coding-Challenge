import axios, { AxiosError } from 'axios';

type ValidationProblem = {
  title?: string;
  errors?: Record<string, string[]>;
};

export type ApiError = {
  /** Headline message (e.g. the ProblemDetails `title`, or a fallback). */
  message: string;
  /** Field-specific errors — empty object if none. */
  fieldErrors: Record<string, string[]>;
};

export function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<ValidationProblem>;
    const data = ax.response?.data;
    if (data?.errors && Object.keys(data.errors).length > 0) {
      return {
        message: data.title ?? 'Validation failed.',
        fieldErrors: data.errors,
      };
    }
    if (data?.title) return { message: data.title, fieldErrors: {} };
    if (ax.response) return {
      message: `Request failed (${ax.response.status} ${ax.response.statusText}).`,
      fieldErrors: {},
    };
    return { message: ax.message, fieldErrors: {} };
  }
  return { message: String(err), fieldErrors: {} };
}

const baseURL = import.meta.env.VITE_API_BASE as string;
const http = axios.create({ baseURL });

export type Player = { number: number; name: string };
export type AddPlayerRequest = Player & { position: string; depth?: number };

export const addPlayer = (req: AddPlayerRequest) => http.post('/', req);

export const removePlayer = (position: string, number: number) =>
  http.delete<Player>(`/${position}/${number}`).then(r => r.data);

export const getBackups = (position: string, number: number) =>
  http.get<Player[]>(`/${position}/${number}/backups`).then(r => r.data);

export const getFullChart = (opts?: { signal?: AbortSignal }) =>
    http.get<Record<string, Player[]>>('/', { signal: opts?.signal })
        .then(r => r.data);