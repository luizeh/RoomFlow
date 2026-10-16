import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import NotFound from '../errors/NotFound';
import { useAuth } from '../../contexts/AuthContext';
import useDeleteReservation from '../../hooks/useDeleteReservation';
import useReservation from '../../hooks/useReservation';
import { leaveReservation, shareReservation, unshareReservation } from '../../services/reservations';
import { confirmDialog, notify } from '../../utils/alerts';
import { formatDateTime } from '../../utils/datetime';
import '../../styles/pages/reservations.css';

// Endereço público do convite (rota /shared/:token do frontend)
const shareUrl = (token) => `${window.location.origin}/shared/${token}`;

export default function ReservationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { reservation, loading, error: loadError, notFound } = useReservation(id);
    const { remove, deleting, error: deleteError } = useDeleteReservation(() => navigate('/reservations'));
    // O backend só manda share_token para quem pode compartilhar (host ou admin)
    const [shareToken, setShareToken] = useState(null);
    const [sharing, setSharing] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        setShareToken(reservation?.share_token ?? null);
    }, [reservation]);

    if (loading) return <p className="state">Carregando reserva...</p>;
    if (notFound) return <NotFound />;
    if (loadError) return <main className="page page-narrow"><p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>Ocorreu um erro: {loadError}</p></main>;
    if (!reservation) return <NotFound />;

    const isHost = reservation.user_id === user.id;
    const canManage = isHost || user.role === 'admin';
    const isParticipant = reservation.participants?.some((participant) => participant.id === user.id);
    const participants = reservation.participants ?? [];

    async function handleCreateLink() {
        setSharing(true);
        try {
            const data = await shareReservation(reservation.id);
            setShareToken(data.share_token);
            notify('Link de convite criado.');
        } catch (err) {
            notify(err.message || 'Erro ao criar o link.', 'error');
        } finally {
            setSharing(false);
        }
    }

    async function handleCopyLink() {
        try {
            await navigator.clipboard.writeText(shareUrl(shareToken));
            notify('Link copiado!');
        } catch {
            notify('Não foi possível copiar. Selecione o link e copie manualmente.', 'error');
        }
    }

    async function handleDisableLink() {
        const confirmed = await confirmDialog({
            title: 'Desativar link?',
            text: 'Quem tiver o link atual não vai mais conseguir abrir o convite. Se gerar um novo depois, ele terá outro endereço.',
            confirmText: 'Desativar',
            danger: true,
        });
        if (!confirmed) return;

        setSharing(true);
        try {
            await unshareReservation(reservation.id);
            setShareToken(null);
            notify('Link desativado.');
        } catch (err) {
            notify(err.message || 'Erro ao desativar o link.', 'error');
        } finally {
            setSharing(false);
        }
    }

    async function handleLeave() {
        const confirmed = await confirmDialog({
            title: 'Sair da reserva?',
            text: 'Ela deixa de aparecer na sua lista. Para voltar, quem criou a reserva precisa convidar você de novo.',
            confirmText: 'Sair',
            danger: true,
        });
        if (!confirmed) return;

        setLeaving(true);
        try {
            await leaveReservation(reservation.id);
            notify('Você saiu da reserva.');
            navigate('/reservations');
        } catch (err) {
            notify(err.message || 'Erro ao sair da reserva.', 'error');
            setLeaving(false);
        }
    }

    return (
        <main className="page page-narrow">
            <Link to="/reservations" className="back-link"><i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Voltar para reservas</Link>
            {deleteError && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{deleteError}</p>}
            <article className="card">
                <div className="detail-header">
                    <span className="icon-box"><i className="fa-regular fa-calendar-check" aria-hidden="true"></i></span>
                    <div>
                        <h1 className="page-title">{reservation.title || `Reserva #${reservation.id}`}</h1>
                        <p className="page-subtitle">
                            {reservation.room?.name || `Sala #${reservation.room_id}`}
                            {!isHost && isParticipant && <> · <span className="badge">Convidado</span></>}
                        </p>
                    </div>
                </div>
                <dl className="detail-list time-range">
                    <div>
                        <dt>Sala</dt>
                        <dd><Link to={`/rooms/${reservation.room_id}`}>{reservation.room?.name || `#${reservation.room_id}`}</Link></dd>
                    </div>
                    <div>
                        <dt>Local</dt>
                        <dd>{reservation.room?.location || '-'}</dd>
                    </div>
                    <div>
                        <dt>Início</dt>
                        <dd>{formatDateTime(reservation.start_at)}</dd>
                    </div>
                    <div>
                        <dt>Fim</dt>
                        <dd>{formatDateTime(reservation.end_at)}</dd>
                    </div>
                    <div className="detail-list-full">
                        <dt>Organizador</dt>
                        <dd>{isHost ? 'Você' : reservation.user?.name}</dd>
                    </div>
                    <div className="detail-list-full">
                        <dt>Convidados ({participants.length})</dt>
                        <dd>
                            {participants.length === 0 ? (
                                <span className="muted">Ninguém convidado.</span>
                            ) : (
                                <ul className="participant-list">
                                    {participants.map((participant) => (
                                        <li key={participant.id}>
                                            <i className="fa-regular fa-user" aria-hidden="true"></i>
                                            <span>{participant.id === user.id ? 'Você' : participant.name}</span>
                                            {participant.email && <span className="participant-email">{participant.email}</span>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </dd>
                    </div>
                </dl>
                <div className="detail-actions">
                    {canManage && (
                        <>
                            <Link to={`/reservations/${reservation.id}/edit`} className="btn btn-secondary">
                                <i className="fa-solid fa-pen" aria-hidden="true"></i> Editar reserva
                            </Link>
                            <button type="button" className="btn btn-danger" onClick={() => remove(reservation)} disabled={deleting}>
                                <i className="fa-regular fa-trash-can" aria-hidden="true"></i> {deleting ? 'Excluindo...' : 'Excluir reserva'}
                            </button>
                        </>
                    )}
                    {!isHost && isParticipant && (
                        <button type="button" className="btn btn-danger" onClick={handleLeave} disabled={leaving}>
                            <i className="fa-solid fa-right-from-bracket" aria-hidden="true"></i> {leaving ? 'Saindo...' : 'Sair da reserva'}
                        </button>
                    )}
                </div>
            </article>

            {canManage && (
                <section className="card share-card">
                    <h2 className="section-title"><i className="fa-solid fa-link" aria-hidden="true"></i> Link de convite</h2>
                    <p className="muted">
                        Qualquer pessoa com o link vê o título, a sala, o horário e o nome do organizador, sem precisar entrar no sistema.
                    </p>
                    {shareToken ? (
                        <>
                            <div className="share-link">
                                <label htmlFor="share_url" className="sr-only">Link de convite</label>
                                <input id="share_url" type="text" value={shareUrl(shareToken)} readOnly onFocus={(event) => event.target.select()} />
                                <button type="button" className="btn btn-primary" onClick={handleCopyLink}>
                                    <i className="fa-regular fa-copy" aria-hidden="true"></i> Copiar
                                </button>
                            </div>
                            <div className="detail-actions">
                                <a href={shareUrl(shareToken)} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                                    <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> Abrir convite
                                </a>
                                <button type="button" className="btn btn-ghost btn-sm" onClick={handleDisableLink} disabled={sharing}>
                                    <i className="fa-solid fa-link-slash" aria-hidden="true"></i> Desativar link
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="detail-actions">
                            <button type="button" className="btn btn-secondary" onClick={handleCreateLink} disabled={sharing}>
                                <i className="fa-solid fa-link" aria-hidden="true"></i> {sharing ? 'Gerando...' : 'Gerar link de convite'}
                            </button>
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}
