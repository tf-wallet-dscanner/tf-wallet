import axios from 'axios';
import { API_URL } from 'constants/environment';

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-type': 'application/json; charset=utf-8',
  },
});

export default instance;
