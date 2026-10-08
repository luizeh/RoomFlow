import { api } from './api';

// Salas para as telas públicas e de usuário (só leitura).
// Criar, editar e excluir ficam em services/admin.js.

export function getRooms() {
    return api.get('/rooms');
}

export function getRoom(id) {
    return api.get(`/rooms/${id}`);
}
