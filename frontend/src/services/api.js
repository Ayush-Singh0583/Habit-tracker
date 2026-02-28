import axios from "axios";

/* =========================
   Axios Instance
========================= */

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

/* =========================
   Request Interceptor
   Attach Access Token
========================= */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* =========================
   Response Interceptor
   Handle Token Refresh
========================= */

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await api.post("/auth/refresh", {
          refreshToken,
        });

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* =========================
   API Modules
========================= */

/* Auth */
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.patch("/auth/profile", data),
};

/* Habits */
export const habitsAPI = {
  getAll: () => api.get("/habits"),
  get: (id) => api.get(`/habits/${id}`),
  create: (data) => api.post("/habits", data),
  update: (id, data) => api.patch(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
};

/* Logs */
export const logsAPI = {
  getAll: (params) => api.get("/logs", { params }),
  getToday: () => api.get("/logs/today"),
  save: (data) => api.post("/logs", data),
  delete: (id) => api.delete(`/logs/${id}`),
};

/* Analytics */
export const analyticsAPI = {
  getOverview: () => api.get("/analytics/overview"),
  getAll: () => api.get("/analytics/all"),
  getHabit: (habitId, params) =>
    api.get(`/analytics/habit/${habitId}`, { params }),
};

/* Reminders */
export const remindersAPI = {
  getAll: () => api.get("/reminders"),
  create: (data) => api.post("/reminders", data),
  update: (id, data) => api.patch(`/reminders/${id}`, data),
  delete: (id) => api.delete(`/reminders/${id}`),
};

/* Export / Import */
export const exportAPI = {
  exportData: (format = "json") =>
    api.get("/export", {
      params: { format },
      responseType: "blob",
    }),
  importData: (data) => api.post("/export/import", data),
};

export default api;