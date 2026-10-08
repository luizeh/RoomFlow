import { api, getCsrfCookie } from './api';

export async function register(data) {
    await getCsrfCookie();
    return api.post('/register', data);
}

export async function login(data) {
    await getCsrfCookie();
    return api.post('/login', data);
}

export function logout() {
    return api.post('/logout');
}

export function getUser() {
    return api.get('/user');
}
