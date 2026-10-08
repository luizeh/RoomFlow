import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteAdminReservation, getAdminReservations } from '../../services/admin';
import { formatDateTime } from '../../utils/datetime';

export default function AdminReservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        getAdminReservations()
            .then(setReservations)
            .catch((err) => setError(err.message || 'Erro ao carregar as reservas.'))
            .finally(() => setLoading(false));
    }, []);

    async function handleDelete(reservation) {
        if (!window.confirm(`Excluir a reserva #${reservation.id}?`)) return;

        setDeletingId(reservation.id);
        setDeleteError(null);
        try {
            await deleteAdminReservation(reservation.id);
            setReservations((current) => current.filter((r) => r.id !== reservation.id));
        } catch (err) {
            setDeleteError(err.message || 'Erro ao excluir a reserva.');
        } finally {
            setDeletingId(null);
        }
    }

    if (loading) return <p>Carregando reservas...</p>;
    if (error) return <p role="alert">Ocorreu um erro: {error}</p>;

    return (
        <main>
            <p><Link to="/admin">Voltar para o painel</Link></p>
            <h1>Todas as reservas</h1>
            {deleteError && <p role="alert">{deleteError}</p>}
            {reservations.length === 0 ? (
                <p>Nenhuma reserva encontrada.</p>
            ) : (
                <ul>
                    {reservations.map((reservation) => (
                        <li key={reservation.id}>
                            #{reservation.id}: {reservation.room?.name}, por {reservation.user?.name},{' '}
                            {formatDateTime(reservation.start_at)} até {formatDateTime(reservation.end_at)}{' '}
                            <Link to={`/admin/reservations/${reservation.id}/edit`}>Editar</Link>{' '}
                            <button type="button" onClick={() => handleDelete(reservation)} disabled={deletingId === reservation.id}>
                                {deletingId === reservation.id ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
