export const BASE_URL =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "https://brain-box-w7mg.onrender.com" : "http://localhost:5555")