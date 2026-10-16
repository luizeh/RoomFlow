import { api } from './api';

// Todas as chamadas do painel admin (/api/admin/...)

export function getDashboard() {
    return api.get('/admin/dashboard');
}

// Salas
export function getAdminRooms() {
    return api.get('/admin/rooms');
}

// Salas são enviadas como multipart/form-data por causa da imagem.
function toRoomFormData(room) {
    const data = new FormData();
    Object.entries(room).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        data.append(key, value);
    });
    return data;
}

export function createRoom(room) {
    return api.post('/admin/rooms', toRoomFormData(room));
}

// O PHP não lê multipart em PUT, então enviamos POST com _method=PUT (method spoofing do Laravel)
export function updateRoom(id, room) {
    const data = toRoomFormData(room);
    data.append('_method', 'PUT');
    return api.post(`/admin/rooms/${id}`, data);
}

export function deleteRoom(id) {
    return api.delete(`/admin/rooms/${id}`);
}

// Usuários
export function getUsers() {
    return api.get('/admin/users');
}

export function getAdminUser(id) {
    return api.get(`/admin/users/${id}`);
}

export function updateUser(id, user) {
    return api.put(`/admin/users/${id}`, user);
}

export function deleteUser(id) {
    return api.delete(`/admin/users/${id}`);
}

// Reservas. status opcional: 'pending', 'approved' ou 'rejected'
export function getAdminReservations(status) {
    return api.get('/admin/reservations', { params: { status: status || undefined } });
}

// Solicitações: aprovar recusa automaticamente as pendentes do mesmo horário
export function approveReservation(id) {
    return api.post(`/admin/reservations/${id}/approve`);
}

export function rejectReservation(id, reason) {
    return api.post(`/admin/reservations/${id}/reject`, { reason: reason || null });
}

export function getPendingCount() {
    return api.get('/admin/reservations/pending-count');
}

// Avisa o menu lateral do painel para atualizar o número de pendentes (depois de aprovar/recusar)
export const PENDING_CHANGED_EVENT = 'roomflow:pending-changed';

export function announcePendingChanged() {
    window.dispatchEvent(new Event(PENDING_CHANGED_EVENT));
}

export function getAdminReservation(id) {
    return api.get(`/admin/reservations/${id}`);
}

export function updateAdminReservation(id, reservation) {
    return api.put(`/admin/reservations/${id}`, reservation);
}

export function deleteAdminReservation(id) {
    return api.delete(`/admin/reservations/${id}`);
}

// Conteúdo do site (landing page e footer). Vai como multipart por causa da imagem de fundo.
export function getAdminSiteSettings() {
    return api.get('/admin/site-settings');
}

export function updateSiteSettings(settings) {
    const data = new FormData();
    Object.entries(settings).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        // FormData só manda texto: booleano vira 1/0 (o Laravel entende como true/false)
        data.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : value);
    });
    data.append('_method', 'PUT');
    return api.post('/admin/site-settings', data);
}
