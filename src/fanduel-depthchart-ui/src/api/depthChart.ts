import axios from 'axios';

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