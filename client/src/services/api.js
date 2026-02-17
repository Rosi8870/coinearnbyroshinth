import axios from "axios";

// Create an axios instance.
// It reads the backend URL from the .env file.
// If it's not found, it falls back to the local development URL.
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Add a request interceptor to include the token in every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;