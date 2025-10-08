import axios from "axios";
import toast from "react-hot-toast";

const instance = axios.create({ baseURL: "/api" });

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = "Bearer " + token;
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      toast.error("Session expired. Please login again.");
      localStorage.clear();
      setTimeout(() => (window.location.href = "/"), 500);
      return Promise.reject(error);
    }
    const msg = error?.response?.data?.error || error?.message || "Request failed";
    toast.error(msg);
    return Promise.reject(error);
  }
);

export default instance;