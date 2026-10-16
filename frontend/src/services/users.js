import { api } from './api';

// Busca usuários por nome ou e-mail para convidar para uma reserva (o próprio usuário não vem).
export function searchUsers(q) {
    return api.get('/users/search', { params: { q } });
}
