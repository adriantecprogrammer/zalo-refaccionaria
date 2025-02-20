import axios from "axios";

const apiProduct = axios.create({
  baseURL: "https://refaccionaria-zalo-demo.clvrt.workers.dev",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiProduct;
