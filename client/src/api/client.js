const rawApiUrl = import.meta.env.VITE_API_URL;
const BASE_URL = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/+$/, '')}/api`)
  : '/api';

/**
 * Universal fetch wrapper for LifeLink API
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('lifelink_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg =
        data.message ||
        (data.errors && data.errors.map((e) => e.message).join(', ')) ||
        `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
      // Clear expired token on unauthorized errors
      localStorage.removeItem('lifelink_token');
      localStorage.removeItem('lifelink_user');
    }
    throw err;
  }
}

export const api = {
  // Auth API
  auth: {
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    getMe: () => request('/auth/me'),
    updateProfile: (updates) => request('/auth/profile', { method: 'PUT', body: updates }),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },

  // Requests API
  requests: {
    create: (requestData) => request('/requests', { method: 'POST', body: requestData }),
    getMyRequests: () => request('/requests/my'),
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/requests${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/requests/${id}`),
    cancel: (id) => request(`/requests/${id}/cancel`, { method: 'PATCH' }),
    fulfill: (id) => request(`/requests/${id}/fulfill`, { method: 'PATCH' }),
  },

  // Matches API
  matches: {
    getPotential: (requestId, options = {}) => {
      const query = new URLSearchParams(options).toString();
      return request(`/requests/${requestId}/matches${query ? `?${query}` : ''}`);
    },
    inviteDonors: (requestId, donorIds) =>
      request(`/requests/${requestId}/invite`, { method: 'POST', body: { donorIds } }),
  },

  // Responses API
  responses: {
    respond: (requestId, data) =>
      request(`/responses/${requestId}`, { method: 'POST', body: data }),
    getMyAlerts: () => request('/responses/my-alerts'),
  },

  // Notifications API
  notifications: {
    getAll: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  },

  // Admin / Reviewer API
  admin: {
    getMetrics: () => request('/admin/metrics'),
    getRequests: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/requests${query ? `?${query}` : ''}`);
    },
    reviewRequest: (id, reviewData) =>
      request(`/admin/requests/${id}/review`, { method: 'POST', body: reviewData }),
    getAuditLogs: () => request('/admin/audit-logs'),
  },

  // System
  health: () => request('/health'),
};
