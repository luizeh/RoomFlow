import { useState } from 'react';
import { deleteReservation } from '../services/reservations';

export default function useDeleteReservation(onDeleted) {
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    async function remove(reservation) {
        if (!window.confirm(`Excluir a reserva #${reservation.id}?`)) return false;

        setDeletingId(reservation.id);
        setError(null);
        try {
            await deleteReservation(reservation.id);
            onDeleted?.(reservation.id);
            return true;
        } catch (err) {
            setError(err.message || 'Erro ao excluir a reserva.');
            return false;
        } finally {
            setDeletingId(null);
        }
    }

    return { remove, deletingId, deleting: deletingId !== null, error };
}
