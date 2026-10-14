import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Setup Axios base URL
axios.defaults.baseURL = 'http://localhost:5001/api';

// Initial authorization header if token exists in localStorage
const initialToken = localStorage.getItem('token');
if (initialToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

// Global 401 Axios response interceptor
let redirectTimeout = null;
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Do not trigger session expired redirect for login failures (e.g., wrong password)
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      
      if (!isLoginRequest) {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];

        // Display toast with unique ID to prevent duplicates if multiple API calls fail simultaneously
        toast.error('Session expired, please log in again', { id: 'session-expired' });

        if (window.location.pathname !== '/login') {
          if (redirectTimeout) clearTimeout(redirectTimeout);
          redirectTimeout = setTimeout(() => {
            window.location.href = '/login';
          }, 300);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Sync token to Axios headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const loadUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await axios.get('/auth/me');
      setUser(res.data.user);
    } catch (error) {
      console.error('Error loading user:', error);
      if (error.response?.status === 401) {
        logout(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    const newToken = res.data.token;
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(res.data.user);
    toast.success('Logged in successfully', { id: 'auth-success' });
  };

  const register = async (name, email, password) => {
    const res = await axios.post('/auth/register', { name, email, password });
    const newToken = res.data.token;
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(res.data.user);
    toast.success('Account registered successfully', { id: 'auth-success' });
  };

  const logout = (showToast = true) => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    if (showToast) {
      toast.success('Signed out successfully', { id: 'signout-success' });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
