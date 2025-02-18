import axios from 'axios';

// Función para leer el token de las cookies
const getAuthTokenFromCookies = () => {
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
  return match ? match[2] : null;
};

const apiClient = axios.create({
  baseURL: 'https://ths-back-hono.clvrt.workers.dev',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inicializa el token desde las cookies si está presente
const token = getAuthTokenFromCookies();
if (token) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Función para establecer el token
export const setAuthToken = (token: string) => {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Función para eliminar el token
export const removeAuthToken = () => {
  delete apiClient.defaults.headers.common['Authorization'];
};

export default apiClient;