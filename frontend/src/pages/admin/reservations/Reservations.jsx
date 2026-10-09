import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteAdminReservation, getAdminReservations } from '../../../services/admin';
import { formatDateTime } from '../../../utils/datetime';
import { confirmDialog, notify } from '../../../utils/alerts';

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
        const confirmed = await confirmDialog({
            title: 'Excluir reserva?',
            text: `A reserva #${reservation.id} será excluída. Essa ação não pode ser desfeita.`,
            confirmText: 'Excluir',
            danger: true,
        });
        if (!confirmed) return;

        setDeletingId(reservation.id);
        setDeleteError(null);
        try {
            await deleteAdminReservation(reservation.id);
            setReservations((current) => current.filter((r) => r.id !== reservation.id));
            notify('Reserva excluída.');
        } catch (err) {
            setDeleteError(err.message || 'Erro ao excluir a reserva.');
        } finally {
            setDeletingId(null);
        }
    }

    if (loading) return <p className="state">Carregando reservas...</p>;
    if (error) return <main className="page"><p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>Ocorreu um erro: {error}</p></main>;

    return (
        <main className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Reservas</h1>
                    <p className="page-subtitle">Todas as reservas feitas no sistema.</p>
                </div>
            </header>
            {deleteError && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{deleteError}</p>}
            {reservations.length === 0 ? (
                <div className="empty-state">
                    <i className="fa-regular fa-calendar" aria-hidden="true"></i>
                    <p>Nenhuma reserva encontrada.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Sala</th>
                                <th>Reservado por</th>
                                <th>Início</th>
                                <th>Fim</th>
                                <th><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((reservation) => (
                                <tr key={reservation.id}>
                                    <td className="table-secondary">{reservation.id}</td>
                                    <td className="table-primary">{reservation.room?.name}</td>
                                    <td className="table-secondary">{reservation.user?.name}</td>
                                    <td className="table-secondary time-range">{formatDateTime(reservation.start_at)}</td>
                                    <td className="table-secondary time-range">{formatDateTime(reservation.end_at)}</td>
                                    <td>
                                        <div className="table-actions">
                                            <Link to={`/admin/reservations/${reservation.id}/edit`} className="btn btn-secondary btn-sm">
                                                <i className="fa-solid fa-pen" aria-hidden="true"></i> Editar
                                            </Link>
                                            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(reservation)} disabled={deletingId === reservation.id}>
                                                <i className="fa-regular fa-trash-can" aria-hidden="true"></i> {deletingId === reservation.id ? 'Excluindo...' : 'Excluir'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
