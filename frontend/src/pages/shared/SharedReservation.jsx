import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getSharedReservation } from '../../services/reservations';
import { formatDateTime } from '../../utils/datetime';
import '../../styles/pages/reservations.css';

// Página pública do link de convite (/shared/:token): qualquer pessoa com o link vê
// título, sala, horário e organizador. Não precisa estar logado.
export default function SharedReservation() {
    const { token } = useParams();
    const { user } = useAuth();
    const [invite, setInvite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        setNotFound(false);

        getSharedReservation(token)
            .then((data) => {
                if (active) setInvite(data);
            })
            .catch((err) => {
                if (!active) return;
                if (err.status === 404) setNotFound(true);
                else if (err.status === 429) setError('Muitas tentativas. Aguarde um minuto e tente de novo.');
                else setError(err.message || 'Erro ao carregar o convite.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [token]);

    if (loading) return <p className="state">Carregando convite...</p>;

    if (notFound) {
        return (
            <main className="page page-narrow">
                <div className="empty-state">
                    <i className="fa-solid fa-link-slash" aria-hidden="true"></i>
                    <p>Este convite não existe ou o link foi desativado pelo organizador.</p>
                    <Link to="/rooms" className="btn btn-secondary btn-sm">Ver salas</Link>
                </div>
            </main>
        );
    }

    if (error) return <main className="page page-narrow"><p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{error}</p></main>;

    const { room } = invite;

    return (
        <main className="page page-narrow">
            <article className={`card shared-invite${room.image_url ? ' has-image' : ''}`}>
                {room.image_url && <img className="shared-invite-image" src={room.image_url} alt={`Foto da sala ${room.name}`} />}
                <div>
                    <p className="shared-invite-eyebrow"><i className="fa-regular fa-envelope-open" aria-hidden="true"></i> {invite.host} convidou você</p>
                    <h1 className="page-title">{invite.title || 'Reunião'}</h1>
                    <dl className="detail-list time-range">
                        <div>
                            <dt>Sala</dt>
                            <dd>{room.name}</dd>
                        </div>
                        <div>
                            <dt>Local</dt>
                            <dd>{room.location || '-'}</dd>
                        </div>
                        <div>
                            <dt>Início</dt>
                            <dd>{formatDateTime(invite.start_at)}</dd>
                        </div>
                        <div>
                            <dt>Fim</dt>
                            <dd>{formatDateTime(invite.end_at)}</dd>
                        </div>
                        <div className="detail-list-full">
                            <dt>Organizador</dt>
                            <dd>{invite.host}</dd>
                        </div>
                    </dl>
                    <div className="detail-actions">
                        {user ? (
                            <Link to="/reservations" className="btn btn-primary">
                                <i className="fa-regular fa-calendar" aria-hidden="true"></i> Minhas reservas
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-primary">Entrar no RoomFlow</Link>
                                <Link to="/register" className="btn btn-secondary">Criar conta</Link>
                            </>
                        )}
                    </div>
                </div>
            </article>
        </main>
    );
}
