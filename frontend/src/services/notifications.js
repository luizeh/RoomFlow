import { api } from './api';

// Avisos do usuário logado (sininho). Retorna { notifications, unread_count }.
export function getNotifications() {
    return api.get('/notifications');
}

export function markNotificationAsRead(id) {
    return api.post(`/notifications/${id}/read`);
}

export function markAllNotificationsAsRead() {
    return api.post('/notifications/read-all');
}
