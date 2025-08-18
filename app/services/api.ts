// src/services/api.ts

import axios from 'axios';

// Crie uma instância do Axios com a URL base da sua API Laravel
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // O endereço do seu servidor Laravel
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export default apiClient;
