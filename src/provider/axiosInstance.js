import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://testebuscapee102030b.onrender.com/api/', 
  timeout: 30000, 
});

axiosInstance.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('@Auth:Token');
    if (token) {
      // Remove aspas extras se houver
      token = token.replace(/"/g, '');
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('Token de autenticação não encontrado no localStorage.');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
