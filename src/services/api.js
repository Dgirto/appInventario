import axios from 'axios';

// En desarrollo las peticiones a /api pasan por el proxy de Vite (vite.config.js),
// así la app funciona también desde un túnel (ngrok). En producción se define VITE_API_URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '' : 'http://localhost:3006')
});

// --- Sesión (Guía #11) ---
// El token JWT se guarda en localStorage tras el login.
export const obtenerToken = () => localStorage.getItem('token');

export const obtenerUsuario = () => {
  try {
    return JSON.parse(localStorage.getItem('usuario')) || null;
  } catch {
    return null;
  }
};

export const cerrarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};

// Configuración de cabeceras con el token: "Authorization: Bearer <token>"
// Uso: api.get('/api/productos', authHeaders())
export const authHeaders = () => ({
  headers: { Authorization: `Bearer ${obtenerToken()}` }
});

// Si el backend responde 401 (token expirado o inválido), cerramos sesión y volvemos al login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const esLogin = error.config?.url?.includes('/api/auth/login');
    if (error.response?.status === 401 && !esLogin) {
      cerrarSesion();
      window.location.assign('/');
    }
    return Promise.reject(error);
  }
);

// Mensaje legible para mostrar al usuario
export const mensajeError = (error) =>
  error.response?.data?.error || 'No se pudo conectar con el servidor.';

export default api;
