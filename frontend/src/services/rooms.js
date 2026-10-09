import { api } from './api';

// Salas para as telas públicas e de usuário (só leitura).
// Criar, editar e excluir ficam em services/admin.js.

export function getRooms() {
    return api.get('/rooms');
}

export function getRoom(id) {
    return api.get(`/rooms/${id}`);
}

// Agenda da sala no período (start/end no formato "YYYY-MM-DD HH:mm:ss").
// Usuário comum recebe só os horários ocupados; admin recebe também quem reservou.
export function getRoomSchedule(id, start, end) {
    return api.get(`/rooms/${id}/schedule`, { params: { start, end } });
}
