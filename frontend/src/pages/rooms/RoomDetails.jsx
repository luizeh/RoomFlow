import { lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import NotFound from '../errors/NotFound';
import useRoom from '../../hooks/useRoom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/pages/rooms.css';

// A agenda (FullCalendar) é pesada: só é baixada quando alguém abre uma sala
const RoomSchedule = lazy(() => import('../../components/RoomSchedule'));

export default function RoomDetails() {
    const { user } = useAuth();
    const { id } = useParams();
    const { room, loading, error: loadError, notFound } = useRoom(id);

    if (loading) return <p className="state">Carregando sala...</p>;
    if (notFound) return <NotFound />;
    if (loadError) return <main className="page page-narrow"><p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>Ocorreu um erro: {loadError}</p></main>;
    if (!room) return <NotFound />;

    return (
        <main className="page">
            <Link to="/rooms" className="back-link"><i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Voltar para salas</Link>
            <article className={`card room-detail${room.image_url ? ' has-image' : ''}`}>
                {room.image_url && (
                    <img className="room-detail-image" src={room.image_url} alt={`Foto da sala ${room.name}`} />
                )}
                <div className="room-detail-info">
                    <div className="detail-header">
                        <span className="icon-box"><i className="fa-solid fa-door-open" aria-hidden="true"></i></span>
                        <div>
                            <h1 className="page-title">{room.name}</h1>
                            <p className="page-subtitle">{room.location}</p>
                        </div>
                    </div>
                    <dl className="detail-list">
                        <div>
                            <dt>Local</dt>
                            <dd>{room.location}</dd>
                        </div>
                        <div>
                            <dt>Capacidade</dt>
                            <dd>{room.capacity} pessoas</dd>
                        </div>
                        <div className="detail-list-full">
                            <dt>Descrição</dt>
                            <dd>{room.description || 'Sem descrição.'}</dd>
                        </div>
                    </dl>
                </div>
            </article>

            <section className="card room-schedule-card">
                <header className="room-schedule-header">
                    <h2 className="section-title">Agenda da sala</h2>
                    {user && <p className="muted">Clique ou arraste num horário livre para reservar.</p>}
                </header>
                {user ? (
                    <Suspense fallback={<p className="state">Carregando agenda...</p>}>
                        <RoomSchedule room={room} user={user} />
                    </Suspense>
                ) : (
                    <p className="muted"><Link to="/login">Entre</Link> para ver os horários livres e reservar esta sala.</p>
                )}
            </section>
        </main>
    );
}
