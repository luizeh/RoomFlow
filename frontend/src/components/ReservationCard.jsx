import { Link } from 'react-router-dom';
import { formatDateTime } from '../utils/datetime';

export default function ReservationCard({ reservation, roomName, onDelete, deleting }) {
    return (
        <article className="card reservation-card">
            <div className="reservation-card-header">
                <h3 className="reservation-card-title">{roomName || `Sala #${reservation.room_id}`}</h3>
                <span className="badge">#{reservation.id}</span>
            </div>
            <ul className="meta-list time-range">
                <li><i className="fa-regular fa-clock" aria-hidden="true"></i>Início: {formatDateTime(reservation.start_at)}</li>
                <li><i className="fa-solid fa-flag-checkered" aria-hidden="true"></i>Fim: {formatDateTime(reservation.end_at)}</li>
            </ul>
            <div className="card-actions">
                <Link to={`/reservations/${reservation.id}`} className="btn btn-secondary btn-sm">
                    <i className="fa-regular fa-eye" aria-hidden="true"></i> Detalhes
                </Link>
                <Link to={`/reservations/${reservation.id}/edit`} className="btn btn-secondary btn-sm">
                    <i className="fa-solid fa-pen" aria-hidden="true"></i> Editar
                </Link>
                <button type="button" className="btn btn-danger btn-sm" onClick={onDelete} disabled={deleting}>
                    <i className="fa-regular fa-trash-can" aria-hidden="true"></i> {deleting ? 'Excluindo...' : 'Excluir'}
                </button>
            </div>
        </article>
    );
}
