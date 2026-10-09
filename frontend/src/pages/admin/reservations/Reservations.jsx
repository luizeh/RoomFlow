import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { deleteAdminReservation, getAdminReservations, getAdminRooms } from '../../../services/admin';
import { formatDateTime } from '../../../utils/datetime';
import { confirmDialog, notify } from '../../../utils/alerts';
import { useAuth } from '../../../contexts/AuthContext';
import '../../../styles/pages/admin-reservations.css';

// A agenda (FullCalendar) só é baixada quando o admin escolhe uma sala
const RoomSchedule = lazy(() => import('../../../components/RoomSchedule'));

const ALL_ROOMS = 'todas';

export default function AdminReservations() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [rooms, setRooms] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    // Muda quando algo é excluído pela tabela, para a agenda buscar de novo
    const [scheduleKey, setScheduleKey] = useState(0);

    // Sala escolhida fica no endereço (?sala=3): sobrevive ao recarregar e ao voltar da edição.
    // Sem ?sala, abre a primeira sala.
    const roomParam = searchParams.get('sala');
    const selectedRoom = roomParam === ALL_ROOMS
        ? null
        : rooms.find((room) => String(room.id) === roomParam) ?? rooms[0] ?? null;
    const selectValue = selectedRoom ? String(selectedRoom.id) : ALL_ROOMS;

    const loadReservations = useCallback(() => {
        return getAdminReservations()
            .then(setReservations)
            .catch((err) => setError(err.message || 'Erro ao carregar as reservas.'));
    }, []);

    useEffect(() => {
        Promise.all([getAdminRooms().then(setRooms), loadReservations()])
            .catch((err) => setError(err.message || 'Erro ao carregar as salas.'))
            .finally(() => setLoading(false));
    }, [loadReservations]);

    function handleRoomChange(event) {
        setSearchParams({ sala: event.target.value });
    }

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
            setScheduleKey((key) => key + 1);
            notify('Reserva excluída.');
        } catch (err) {
            setDeleteError(err.message || 'Erro ao excluir a reserva.');
        } finally {
            setDeletingId(null);
        }
    }

    if (loading) return <p className="state">Carregando reservas...</p>;
    if (error) return <main className="page"><p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>Ocorreu um erro: {error}</p></main>;

    const visibleReservations = selectedRoom
        ? reservations.filter((reservation) => reservation.room_id === selectedRoom.id)
        : reservations;

    return (
        <main className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Reservas</h1>
                    <p className="page-subtitle">Escolha uma sala para ver a agenda e gerenciar as reservas de todos.</p>
                </div>
                <div className="field room-picker">
                    <label htmlFor="room-picker" className="sr-only">Sala</label>
                    <div className="input-icon">
                        <i className="fa-solid fa-door-open" aria-hidden="true"></i>
                        <select id="room-picker" value={selectValue} onChange={handleRoomChange}>
                            {rooms.map((room) => (
                                <option key={room.id} value={room.id}>{room.name}</option>
                            ))}
                            <option value={ALL_ROOMS}>Todas as salas (só lista)</option>
                        </select>
                        <i className="fa-solid fa-chevron-down input-chevron" aria-hidden="true"></i>
                    </div>
                </div>
            </header>

            {selectedRoom && (
                <section className="card admin-schedule-card">
                    <header className="room-schedule-header">
                        <h2 className="section-title">Agenda: {selectedRoom.name}</h2>
                        <p className="muted">Arraste uma reserva para mudar o horário, ou clique nela para editar ou excluir.</p>
                    </header>
                    <Suspense fallback={<p className="state">Carregando agenda...</p>}>
                        {/* key: troca de sala monta uma agenda nova */}
                        <RoomSchedule
                            key={selectedRoom.id}
                            room={selectedRoom}
                            user={user}
                            manage
                            onChange={loadReservations}
                            reloadKey={scheduleKey}
                        />
                    </Suspense>
                </section>
            )}

            <h2 className="section-title">
                {selectedRoom ? `Todas as reservas: ${selectedRoom.name}` : 'Todas as reservas'}
            </h2>
            {deleteError && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{deleteError}</p>}
            {visibleReservations.length === 0 ? (
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
                            {visibleReservations.map((reservation) => (
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
