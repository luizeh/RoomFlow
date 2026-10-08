import { api } from './api';

// Todas as chamadas do painel admin (/api/admin/...)

export function getDashboard() {
    return api.get('/admin/dashboard');
}

// Salas
export function getAdminRooms() {
    return api.get('/admin/rooms');
}

export function createRoom(room) {
    return api.post('/admin/rooms', room);
}

export function updateRoom(id, room) {
    return api.put(`/admin/rooms/${id}`, room);
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

// Reservas
export function getAdminReservations() {
    return api.get('/admin/reservations');
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
