import axios from 'axios';

// Ensure consistent origin - use localhost instead of 127.0.0.1 for better cookie handling
const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CRITICAL: Must be true to send cookies with cross-origin requests
});

// Helper function to get CSRF token from cookie
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Fetch CSRF token on initialization
let csrfTokenPromise = null;

async function ensureCsrfToken() {
  if (csrfTokenPromise) {
    return csrfTokenPromise;
  }

  csrfTokenPromise = (async () => {
    let token = getCookie('csrftoken');
    if (token) {
      return token;
    }

    try {
      // Try to get CSRF token from API login endpoint (GET request)
      const response = await api.get('/login/');
      token = response.data.csrf_token || getCookie('csrftoken');
    } catch (error) {
      // If that fails, try the admin login page endpoint
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
        await fetch(`${baseUrl}/admin/login/`, {
          method: 'GET',
          credentials: 'include',
        });
        token = getCookie('csrftoken');
      } catch (e) {
        console.warn('Could not fetch CSRF token:', e);
      }
    }

    return token;
  })();

  return csrfTokenPromise;
}

// Request interceptor to add CSRF token
api.interceptors.request.use(
  async (config) => {
    // For state-changing methods, ensure we have CSRF token
    if (config.method === 'post' || config.method === 'put' || config.method === 'delete' || config.method === 'patch') {
      // Get CSRF token from cookie first
      let csrfToken = getCookie('csrftoken');

      // If no token in cookie, fetch it
      if (!csrfToken) {
        try {
          csrfTokenPromise = null; // Reset to force new fetch
          csrfToken = await ensureCsrfToken();
        } catch (error) {
          console.warn('Could not fetch CSRF token:', error);
        }
      }

      // Add CSRF token to headers
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and extract CSRF token
api.interceptors.response.use(
  (response) => {
    // CSRF token might be in response cookies, which will be automatically set
    return response;
  },
  async (error) => {
    // Handle 403 Forbidden (could be CSRF or auth issue)
    if (error.response?.status === 403) {
      const errorDetail = error.response?.data?.detail || '';

      // If it's a CSRF error (not an auth credentials error), try to get token and retry
      if (errorDetail.includes('CSRF')) {
        try {
          // Fetch CSRF token from login endpoint
          const response = await api.get('/login/');
          const csrfToken = response.data.csrf_token || getCookie('csrftoken');

          // Retry the original request with CSRF token
          if (csrfToken && error.config) {
            error.config.headers['X-CSRFToken'] = csrfToken;
            return api.request(error.config);
          }
        } catch (retryError) {
          console.error('Failed to retry request:', retryError);
        }
      }

      // If it's an authentication credentials error, the session cookie might not be set
      // This usually means the user needs to log in again
      if (errorDetail.includes('Authentication credentials') || errorDetail.includes('credentials')) {
        console.warn('Session cookie not found or invalid. User may need to log in again.');
        // Clear auth state and redirect to login if not already there
        localStorage.removeItem('isAuthenticated');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('isAuthenticated');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
