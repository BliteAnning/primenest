import axios from "axios";

const url = import.meta.env.VITE_API_URL;
const axiosInstance = axios.create({
    baseURL: url + "/api/v1",
    headers: {
        "Content-Type": "application/json",
        withCredentials: true,
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiry
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.status, error.response?.data);
        if (
            error.response &&
            (error.response.status === 401 ||
                (error.response.data && error.response.data.message && error.response.data.message.toLowerCase().includes("token")))
        ) {
            // Remove token and redirect to login
            localStorage.removeItem("token");
            //window.location.href = "/bundle"; // or use your router's navigation
        }
        return Promise.reject(error);
    }
);

export const setAuthSession = (token, user) => {
  if (token) {
    localStorage.setItem("token", token);
  }
  if (user) {
    localStorage.setItem("primenestUser", JSON.stringify(user));
  }
};

export default axiosInstance;