import axios from "axios";

const validateToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNsdnJ0ZGV2c0BnbWFpbC5jb20iLCJleHAiOjE3MzI5MDgwMzR9.MVtvI8Mj3XBJ1ohqEFuYZsbcEFDXWkJ6_tZ4lvEpU";

const apiOrders = axios.create({
  baseURL: "https://ths-back-hono.clvrt.workers.dev",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${validateToken}`,
  },
});

// Función para eliminar el token
export const removeAuthToken = () => {
  delete apiOrders.defaults.headers.common["Authorization"];
};

export default apiOrders;
