
import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
  withCredentials: true,
});

export default api;
