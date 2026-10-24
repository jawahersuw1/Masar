// One place for every backend call. Components never use fetch directly.
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

let currentUserId = null;
let onUnauthorized = null;
export const setApiUser = (id) => { currentUserId = id; };
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (currentUserId) headers['x-user-id'] = String(currentUserId); // demo auth, see backend README

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError(0, `Cannot reach the Masar server at ${BASE}. Check that the backend is running.`);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) onUnauthorized?.();
    throw new ApiError(res.status, data?.error ?? res.statusText ?? 'Request failed', data?.details);
  }
  return data;
}

export const api = {
  health: () => request('/api/health'),
  sectors: () => request('/api/sectors'),
  banks: () => request('/api/banks'),
  users: () => request('/api/users'),
  // client
  analyze: (inputs) => request('/api/analyze', { method: 'POST', body: { inputs } }),
  simulate: (inputs, changes) => request('/api/simulate', { method: 'POST', body: { inputs, changes } }),
  submitApplication: (bankId, inputs) => request('/api/applications', { method: 'POST', body: { bankId, inputs } }),
  myApplications: () => request('/api/applications/mine'),
  // shared (backend decides client vs bank view from the user's role)
  application: (id) => request(`/api/applications/${id}`),
  explanation: (id) => request(`/api/applications/${id}/explanation`),
  // reviewer
  bankApplications: () => request('/api/bank/applications'),
  bankSettings: () => request('/api/bank/settings'),
  report: (id) => request(`/api/applications/${id}/report`),
  actions: (id) => request(`/api/applications/${id}/actions`),
  act: (id, action, comment) => request(`/api/applications/${id}/actions`, { method: 'POST', body: { action, comment } }),
};