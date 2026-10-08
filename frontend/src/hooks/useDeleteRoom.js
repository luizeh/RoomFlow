import { useState } from 'react';
import { deleteRoom } from '../services/admin';

export default function useDeleteRoom(onDeleted) {
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    async function remove(room) {
        if (!window.confirm(`Excluir a sala "${room.name}"?`)) return false;

        setDeletingId(room.id);
        setError(null);
        try {
            await deleteRoom(room.id);
            onDeleted?.(room.id);
            return true;
        } catch (err) {
            setError(err.message || 'Erro ao excluir a sala.');
            return false;
        } finally {
            setDeletingId(null);
        }
    }

    return { remove, deletingId, deleting: deletingId !== null, error };
}
