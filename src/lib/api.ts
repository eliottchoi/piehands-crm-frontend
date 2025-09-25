import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// You can add interceptors for handling auth tokens, errors, etc. here later.

export default api;
