import { Link, useNavigate, useParams } from 'react-router-dom';
import NotFound from '../errors/NotFound';
import useDeleteReservation from '../../hooks/useDeleteReservation';
import useReservation from '../../hooks/useReservation';
import useRoom from '../../hooks/useRoom';
import { formatDateTime } from '../../utils/datetime';

export default function ReservationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { reservation, loading, error: loadError, notFound } = useReservation(id);
    const { room } = useRoom(reservation?.room_id);
    const { remove, deleting, error: deleteError } = useDeleteReservation(() => navigate('/reservations'));

    if (loading) return <p className="state">Carregando reserva...</p>;
    if (notFound) return <NotFound />;
    if (loadError) return <main className="page page-narrow"><p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>Ocorreu um erro: {loadError}</p></main>;
    if (!reservation) return <NotFound />;

    return (
        <main className="page page-narrow">
            <Link to="/reservations" className="back-link"><i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Voltar para reservas</Link>
            {deleteError && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{deleteError}</p>}
            <article className="card">
                <div className="detail-header">
                    <span className="icon-box"><i className="fa-regular fa-calendar-check" aria-hidden="true"></i></span>
                    <div>
                        <h1 className="page-title">Reserva #{reservation.id}</h1>
                        <p className="page-subtitle">{room?.name || `Sala #${reservation.room_id}`}</p>
                    </div>
                </div>
                <dl className="detail-list time-range">
                    <div className="detail-list-full">
                        <dt>Sala</dt>
                        <dd><Link to={`/rooms/${reservation.room_id}`}>{room?.name || `#${reservation.room_id}`}</Link></dd>
                    </div>
                    <div>
                        <dt>Início</dt>
                        <dd>{formatDateTime(reservation.start_at)}</dd>
                    </div>
                    <div>
                        <dt>Fim</dt>
                        <dd>{formatDateTime(reservation.end_at)}</dd>
                    </div>
                </dl>
                <div className="detail-actions">
                    <Link to={`/reservations/${reservation.id}/edit`} className="btn btn-secondary">
                        <i className="fa-solid fa-pen" aria-hidden="true"></i> Editar reserva
                    </Link>
                    <button type="button" className="btn btn-danger" onClick={() => remove(reservation)} disabled={deleting}>
                        <i className="fa-regular fa-trash-can" aria-hidden="true"></i> {deleting ? 'Excluindo...' : 'Excluir reserva'}
                    </button>
                </div>
            </article>
        </main>
    );
}
