import { Link } from 'react-router-dom';
import ReservationCard from '../../components/ReservationCard';
import useDeleteReservation from '../../hooks/useDeleteReservation';
import useReservations from '../../hooks/useReservations';
import useRooms from '../../hooks/useRooms';
import '../../styles/pages/reservations.css';

export default function Reservations() {
    const { reservations, loading, error, removeReservation } = useReservations();
    const { rooms } = useRooms();
    const { remove, deletingId, error: deleteError } = useDeleteReservation(removeReservation);

    if (loading) return <p className="state">Carregando reservas...</p>;
    if (error) return <main className="page"><p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>Ocorreu um erro: {error}</p></main>;

    const roomNames = Object.fromEntries(rooms.map((room) => [room.id, room.name]));

    return (
        <main className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Minhas reservas</h1>
                    <p className="page-subtitle">Acompanhe, edite ou cancele as suas reservas.</p>
                </div>
                <Link to="/reservations/new" className="btn btn-primary">
                    <i className="fa-solid fa-plus" aria-hidden="true"></i> Nova reserva
                </Link>
            </header>
            {deleteError && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{deleteError}</p>}
            {reservations.length === 0 ? (
                <div className="empty-state">
                    <i className="fa-regular fa-calendar" aria-hidden="true"></i>
                    <p>Nenhuma reserva encontrada.</p>
                    <Link to="/reservations/new" className="btn btn-secondary btn-sm">Fazer minha primeira reserva</Link>
                </div>
            ) : (
                <div className="card-grid">
                    {reservations.map((reservation) => (
                        <ReservationCard
                            key={reservation.id}
                            reservation={reservation}
                            roomName={roomNames[reservation.room_id]}
                            onDelete={() => remove(reservation)}
                            deleting={deletingId === reservation.id}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}
