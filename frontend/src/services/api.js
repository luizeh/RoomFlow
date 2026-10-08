import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json',
    },
});

api.interceptors.response.use(
    (response) => (response.status === 204 ? null : response.data),
    (err) => {
        const payload = err.response?.data;
        const status = err.response?.status;
        const error = new Error(payload?.message || (status ? `API error: ${status}` : err.message));
        error.status = status ?? null;
        error.validationErrors = payload?.errors || null;
        return Promise.reject(error);
    }
);

// A rota do Sanctum fica na raiz do backend, fora do prefixo /api
export function getCsrfCookie() {
    return axios.get(new URL('/sanctum/csrf-cookie', API_URL).href, {
        withCredentials: true,
    });
}
