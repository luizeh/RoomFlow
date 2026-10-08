import { Link } from 'react-router-dom';
import ReservationCard from '../components/ReservationCard';
import useDeleteReservation from '../hooks/useDeleteReservation';
import useReservations from '../hooks/useReservations';
import useRooms from '../hooks/useRooms';

export default function Reservations() {
    const { reservations, loading, error, removeReservation } = useReservations();
    const { rooms } = useRooms();
    const { remove, deletingId, error: deleteError } = useDeleteReservation(removeReservation);

    if (loading) return <p>Carregando reservas...</p>;
    if (error) return <p role="alert">Ocorreu um erro: {error}</p>;

    const roomNames = Object.fromEntries(rooms.map((room) => [room.id, room.name]));

    return (
        <main>
            <h1>Minhas reservas</h1>
            <p><Link to="/reservations/new">Criar reserva</Link></p>
            {deleteError && <p role="alert">{deleteError}</p>}
            {reservations.length === 0 ? (
                <p>Nenhuma reserva encontrada.</p>
            ) : (
                <div>
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
