import { useState } from 'react';
import { deleteReservation } from '../services/reservations';
import { confirmDialog, notify } from '../utils/alerts';

export default function useDeleteReservation(onDeleted) {
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    async function remove(reservation) {
        const confirmed = await confirmDialog({
            title: 'Excluir reserva?',
            text: `A reserva #${reservation.id} será excluída. Essa ação não pode ser desfeita.`,
            confirmText: 'Excluir',
            danger: true,
        });
        if (!confirmed) return false;

        setDeletingId(reservation.id);
        setError(null);
        try {
            await deleteReservation(reservation.id);
            onDeleted?.(reservation.id);
            notify('Reserva excluída.');
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
