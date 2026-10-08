import { Link } from 'react-router-dom';
import { formatDateTime } from '../utils/datetime';

export default function ReservationCard({ reservation, roomName, onDelete, deleting }) {
    return (
        <div>
            <h3>Reserva #{reservation.id}</h3>
            <p><strong>Sala:</strong> {roomName || `#${reservation.room_id}`}</p>
            <p><strong>Início:</strong> {formatDateTime(reservation.start_at)}</p>
            <p><strong>Fim:</strong> {formatDateTime(reservation.end_at)}</p>
            <p><Link to={`/reservations/${reservation.id}`}>Ver detalhes</Link></p>
            <p><Link to={`/reservations/${reservation.id}/edit`}>Editar</Link></p>
            <button type="button" onClick={onDelete} disabled={deleting}>
                {deleting ? 'Excluindo...' : 'Excluir'}
            </button>
        </div>
    );
}
