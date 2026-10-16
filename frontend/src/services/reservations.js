import { api } from './api';

export function getReservations() {
    return api.get('/reservations');
}

export function getReservation(id) {
    return api.get(`/reservations/${id}`);
}

export function createReservation(reservation) {
    return api.post('/reservations', reservation);
}

export function updateReservation(id, reservation) {
    return api.put(`/reservations/${id}`, reservation);
}

export function deleteReservation(id) {
    return api.delete(`/reservations/${id}`);
}

// O participante sai da reserva (ela continua existindo para o host e os outros)
export function leaveReservation(id) {
    return api.delete(`/reservations/${id}/participation`);
}

// Link de convite: gera (ou devolve o que já existe) e desativa. Só o host ou admin.
export function shareReservation(id) {
    return api.post(`/reservations/${id}/share`);
}

export function unshareReservation(id) {
    return api.delete(`/reservations/${id}/share`);
}

// Página pública do convite: não precisa estar logado
export function getSharedReservation(token) {
    return api.get(`/shared-reservations/${token}`);
}
