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
      // Try to get CSRF token from API login endpoint
      const response = await axios.get('/login/', {
        withCredentials: true,
      });
      token = response.data.csrf_token || getCookie('csrftoken');
    } catch (error) {
      // Fallback: try to get from base URL
      try {
        await axios.get(
          import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://127.0.0.1:8000',
          { withCredentials: true }
        );
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
    // Get CSRF token from cookie first
    let csrfToken = getCookie('csrftoken');

    // If no CSRF token and it's a state-changing method, fetch it
    if (!csrfToken && (config.method === 'post' || config.method === 'put' || config.method === 'delete' || config.method === 'patch')) {
      csrfToken = await ensureCsrfToken();
      csrfTokenPromise = null; // Reset promise for next time
    }

    // Add CSRF token to headers for state-changing methods
    if (csrfToken && (config.method === 'post' || config.method === 'put' || config.method === 'delete' || config.method === 'patch')) {
      config.headers['X-CSRFToken'] = csrfToken;
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

      // If it's a CSRF error, try to get token and retry
      if (errorDetail.includes('CSRF') || !errorDetail.includes('credentials')) {
        try {
          // Fetch CSRF token
          await axios.get(
            import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://127.0.0.1:8000',
            { withCredentials: true }
          );
          const csrfToken = getCookie('csrftoken');

          // Retry the original request with CSRF token
          if (csrfToken && error.config) {
            error.config.headers['X-CSRFToken'] = csrfToken;
            return api.request(error.config);
          }
        } catch (retryError) {
          console.error('Failed to retry request:', retryError);
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
