import axios from "axios";

const getAuthTokenFromCookies = () => {
  const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
  return match ? match[2] : null;
};

const apiPromoCodes = axios.create({
  baseURL: "https://refaccionaria-zalo-demo.clvrt.workers.dev",
  headers: {
    "Content-Type": "application/json",
  },
});

const token = getAuthTokenFromCookies();
if (token) {
  apiPromoCodes.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Función para establecer el token
export const setAuthToken = (token: string) => {
  apiPromoCodes.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// Función para eliminar el token
export const removeAuthToken = () => {
  delete apiPromoCodes.defaults.headers.common["Authorization"];
};

export default apiPromoCodes;
