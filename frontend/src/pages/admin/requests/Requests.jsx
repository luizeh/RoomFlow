import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import StatusBadge from '../../../components/StatusBadge';
import { announcePendingChanged, approveReservation, getAdminReservations, rejectReservation } from '../../../services/admin';
import { confirmDialog, notify, promptDialog } from '../../../utils/alerts';
import { formatDateTime } from '../../../utils/datetime';
import '../../../styles/pages/admin-requests.css';

const TABS = [
    { status: 'pending', label: 'Pendentes', icon: 'fa-regular fa-hourglass-half' },
    { status: 'approved', label: 'Aprovadas', icon: 'fa-solid fa-check' },
    { status: 'rejected', label: 'Recusadas', icon: 'fa-solid fa-xmark' },
];

const toDate = (value) => new Date(value.replace(' ', 'T'));

// "07/01/2030 14:00 – 15:00" (ou com a data do fim, se terminar em outro dia)
function formatPeriod(reservation) {
    const start = formatDateTime(reservation.start_at);
    const end = formatDateTime(reservation.end_at);
    return start.slice(0, 10) === end.slice(0, 10) ? `${start} – ${end.slice(11)}` : `${start} – ${end}`;
}

// Outras solicitações pendentes da mesma sala que batem com o horário desta
function findConflicts(reservation, list) {
    return list.filter((other) => other.id !== reservation.id
        && other.room_id === reservation.room_id
        && other.start_at < reservation.end_at
        && other.end_at > reservation.start_at);
}

function errorMessage(err, fallback) {
    return err.validationErrors ? Object.values(err.validationErrors).flat().join(' ') : err.message || fallback;
}

// Painel admin: fila de solicitações de reserva. O admin aprova ou recusa (com motivo opcional).
export default function Requests() {
    const [searchParams, setSearchParams] = useSearchParams();
    const status = TABS.some((tab) => tab.status === searchParams.get('status')) ? searchParams.get('status') : 'pending';
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busyId, setBusyId] = useState(null);
    // Para marcar "Horário já passou" (fixado quando a tela abre)
    const [now] = useState(() => new Date());

    const load = useCallback(() => {
        return getAdminReservations(status)
            .then((data) => {
                setReservations(data);
                setError(null);
            })
            .catch((err) => setError(err.message || 'Erro ao carregar as solicitações.'))
            .finally(() => setLoading(false));
    }, [status]);

    useEffect(() => {
        load();
    }, [load]);

    function changeTab(tabStatus) {
        if (tabStatus === status) return;
        setLoading(true);
        setSearchParams({ status: tabStatus });
    }

    async function handleApprove(reservation) {
        const conflicts = status === 'pending' ? findConflicts(reservation, reservations) : [];
        const conflictText = conflicts.length === 1
            ? ' A outra solicitação que disputa este horário será recusada automaticamente.'
            : conflicts.length > 1
                ? ` As ${conflicts.length} solicitações que disputam este horário serão recusadas automaticamente.`
                : '';

        const confirmed = await confirmDialog({
            title: 'Aprovar solicitação?',
            text: `${reservation.user?.name} · ${reservation.room?.name} · ${formatPeriod(reservation)}.${conflictText} O solicitante recebe um e-mail.`,
            icon: 'question',
            confirmText: 'Aprovar',
        });
        if (!confirmed) return;

        setBusyId(reservation.id);
        try {
            const result = await approveReservation(reservation.id);
            notify(result.auto_rejected
                ? `Aprovada. ${result.auto_rejected} solicitação(ões) conflitante(s) recusada(s).`
                : 'Solicitação aprovada.');
            announcePendingChanged();
            await load();
        } catch (err) {
            notify(errorMessage(err, 'Erro ao aprovar.'), 'error');
        } finally {
            setBusyId(null);
        }
    }

    async function handleReject(reservation) {
        const isApproved = reservation.status === 'approved';
        const reason = await promptDialog({
            title: isApproved ? 'Cancelar reserva aprovada?' : 'Recusar solicitação?',
            text: `${reservation.user?.name} · ${reservation.room?.name} · ${formatPeriod(reservation)}. O motivo é opcional e aparece para o solicitante, que recebe um e-mail.`,
            placeholder: 'Motivo (opcional). Ex.: sala reservada para manutenção',
            confirmText: isApproved ? 'Cancelar reserva' : 'Recusar',
            danger: true,
        });
        if (reason === null) return;

        setBusyId(reservation.id);
        try {
            await rejectReservation(reservation.id, reason);
            notify(isApproved ? 'Reserva cancelada.' : 'Solicitação recusada.');
            announcePendingChanged();
            await load();
        } catch (err) {
            notify(errorMessage(err, 'Erro ao recusar.'), 'error');
        } finally {
            setBusyId(null);
        }
    }

    return (
        <main className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Solicitações</h1>
                    <p className="page-subtitle">Aprove ou recuse os pedidos de reserva dos usuários. Só reservas aprovadas ocupam a sala.</p>
                </div>
            </header>

            <nav className="tabs" aria-label="Situação">
                {TABS.map((tab) => (
                    <button
                        key={tab.status}
                        type="button"
                        className="tab"
                        aria-pressed={status === tab.status}
                        onClick={() => changeTab(tab.status)}
                    >
                        <i className={tab.icon} aria-hidden="true"></i> {tab.label}
                    </button>
                ))}
            </nav>

            {error && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{error}</p>}

            {loading ? (
                <p className="state">Carregando solicitações...</p>
            ) : reservations.length === 0 ? (
                <div className="empty-state">
                    <i className={status === 'pending' ? 'fa-regular fa-circle-check' : 'fa-regular fa-folder-open'} aria-hidden="true"></i>
                    <p>{status === 'pending' ? 'Nenhuma solicitação esperando resposta.' : 'Nada por aqui.'}</p>
                </div>
            ) : (
                <ul className="request-list">
                    {reservations.map((reservation) => {
                        const conflicts = status === 'pending' ? findConflicts(reservation, reservations) : [];
                        const isPast = toDate(reservation.end_at) < now;
                        const busy = busyId === reservation.id;
                        return (
                            <li key={reservation.id} className="card request-item">
                                <div className="request-main">
                                    <div className="request-heading">
                                        <h2 className="request-title">{reservation.title || `Reserva #${reservation.id}`}</h2>
                                        <StatusBadge status={reservation.status} />
                                        {conflicts.length > 0 && (
                                            <span className="badge badge-pending" title="Outras solicitações pedem o mesmo horário nesta sala">
                                                <i className="fa-solid fa-code-compare" aria-hidden="true"></i>
                                                Disputa com {conflicts.length}
                                            </span>
                                        )}
                                        {isPast && <span className="badge">Horário já passou</span>}
                                    </div>
                                    <ul className="meta-list time-range">
                                        <li><i className="fa-regular fa-user" aria-hidden="true"></i>{reservation.user?.name} <span className="muted">({reservation.user?.email})</span></li>
                                        <li><i className="fa-solid fa-door-open" aria-hidden="true"></i>{reservation.room?.name}</li>
                                        <li><i className="fa-regular fa-clock" aria-hidden="true"></i>{formatPeriod(reservation)}</li>
                                        {reservation.participants?.length > 0 && (
                                            <li><i className="fa-solid fa-user-group" aria-hidden="true"></i>{reservation.participants.length} convidado(s)</li>
                                        )}
                                    </ul>
                                    {reservation.status === 'rejected' && reservation.rejection_reason && (
                                        <p className="request-reason"><strong>Motivo:</strong> {reservation.rejection_reason}</p>
                                    )}
                                </div>
                                <div className="request-actions">
                                    {reservation.status !== 'approved' && (
                                        <button type="button" className="btn btn-primary btn-sm" onClick={() => handleApprove(reservation)} disabled={busy}>
                                            <i className="fa-solid fa-check" aria-hidden="true"></i> Aprovar
                                        </button>
                                    )}
                                    {reservation.status !== 'rejected' && (
                                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleReject(reservation)} disabled={busy}>
                                            <i className="fa-solid fa-xmark" aria-hidden="true"></i> {reservation.status === 'approved' ? 'Cancelar' : 'Recusar'}
                                        </button>
                                    )}
                                    <Link to={`/admin/reservations/${reservation.id}/edit`} className="btn btn-ghost btn-sm">
                                        <i className="fa-solid fa-pen" aria-hidden="true"></i> Editar
                                    </Link>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </main>
    );
}
