import { Link } from 'react-router-dom';
import { formatDateTime } from '../utils/datetime';
import StatusBadge from './StatusBadge';

// isHost: a reserva é do usuário (pode editar/excluir). Senão ele é convidado e só vê os detalhes.
export default function ReservationCard({ reservation, isHost, onDelete, deleting }) {
    const roomName = reservation.room?.name || `Sala #${reservation.room_id}`;

    return (
        <article className="card reservation-card">
            <div className="reservation-card-header">
                <div className="reservation-card-heading">
                    <h3 className="reservation-card-title">{reservation.title || roomName}</h3>
                    {reservation.title && <p className="reservation-card-room">{roomName}</p>}
                </div>
                <div className="reservation-card-badges">
                    <StatusBadge status={reservation.status} />
                    {!isHost && <span className="badge badge-strong">Convidado</span>}
                </div>
            </div>
            {reservation.status === 'rejected' && reservation.rejection_reason && (
                <p className="reservation-card-reason"><strong>Motivo:</strong> {reservation.rejection_reason}</p>
            )}
            <ul className="meta-list time-range">
                <li><i className="fa-regular fa-clock" aria-hidden="true"></i>Início: {formatDateTime(reservation.start_at)}</li>
                <li><i className="fa-solid fa-flag-checkered" aria-hidden="true"></i>Fim: {formatDateTime(reservation.end_at)}</li>
                {!isHost && reservation.user && (
                    <li><i className="fa-regular fa-user" aria-hidden="true"></i>Organizador: {reservation.user.name}</li>
                )}
            </ul>
            <div className="card-actions">
                <Link to={`/reservations/${reservation.id}`} className="btn btn-secondary btn-sm">
                    <i className="fa-regular fa-eye" aria-hidden="true"></i> Detalhes
                </Link>
                {isHost && (
                    <>
                        <Link to={`/reservations/${reservation.id}/edit`} className="btn btn-secondary btn-sm">
                            <i className="fa-solid fa-pen" aria-hidden="true"></i> Editar
                        </Link>
                        <button type="button" className="btn btn-danger btn-sm" onClick={onDelete} disabled={deleting}>
                            <i className="fa-regular fa-trash-can" aria-hidden="true"></i> {deleting ? 'Excluindo...' : 'Excluir'}
                        </button>
                    </>
                )}
            </div>
        </article>
    );
}
