import { Link, useNavigate, useParams } from 'react-router-dom';
import NotFound from './NotFound';
import useDeleteReservation from '../hooks/useDeleteReservation';
import useReservation from '../hooks/useReservation';
import useRoom from '../hooks/useRoom';
import { formatDateTime } from '../utils/datetime';

export default function ReservationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { reservation, loading, error: loadError, notFound } = useReservation(id);
    const { room } = useRoom(reservation?.room_id);
    const { remove, deleting, error: deleteError } = useDeleteReservation(() => navigate('/reservations'));

    if (loading) return <p>Carregando reserva...</p>;
    if (notFound) return <NotFound />;
    if (loadError) return <p role="alert">Ocorreu um erro: {loadError}</p>;
    if (!reservation) return <NotFound />;

    return (
        <main>
            <p><Link to="/reservations">Voltar para reservas</Link></p>
            <h1>Reserva #{reservation.id}</h1>
            <p>
                <strong>Sala:</strong>{' '}
                <Link to={`/rooms/${reservation.room_id}`}>{room?.name || `#${reservation.room_id}`}</Link>
            </p>
            <p><strong>Início:</strong> {formatDateTime(reservation.start_at)}</p>
            <p><strong>Fim:</strong> {formatDateTime(reservation.end_at)}</p>
            <p><Link to={`/reservations/${reservation.id}/edit`}>Editar reserva</Link></p>
            <button type="button" onClick={() => remove(reservation)} disabled={deleting}>
                {deleting ? 'Excluindo...' : 'Excluir reserva'}
            </button>
            {deleteError && <p role="alert">{deleteError}</p>}
        </main>
    );
}
