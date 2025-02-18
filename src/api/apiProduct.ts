import axios from 'axios';

const apiProduct = axios.create({
  baseURL: 'https://ths-back-hono.clvrt.workers.dev',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiProduct;
