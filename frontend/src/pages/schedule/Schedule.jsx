import { lazy, Suspense, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import useRooms from '../../hooks/useRooms';
import { roomColor } from '../../utils/roomColors';
import '../../styles/pages/rooms.css';
import '../../styles/schedule.css';

// A agenda (FullCalendar) é pesada: só é baixada quando alguém abre a página
const RoomSchedule = lazy(() => import('../../components/RoomSchedule'));

// Agenda geral: reservas de todas as salas num calendário só, com filtro por sala.
export default function Schedule() {
    const { user } = useAuth();
    const { rooms, loading, error } = useRooms();
    // Salas desmarcadas no filtro (começa com todas visíveis)
    const [hiddenIds, setHiddenIds] = useState([]);

    if (loading) return <p className="state">Carregando salas...</p>;
    if (error) return <main className="page"><p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>Ocorreu um erro: {error}</p></main>;

    const visibleIds = rooms.filter((room) => !hiddenIds.includes(room.id)).map((room) => room.id);

    function toggleRoom(id) {
        setHiddenIds((current) => {
            const next = current.includes(id) ? current.filter((hidden) => hidden !== id) : [...current, id];
            // Não deixa desmarcar todas: a agenda ficaria vazia sem motivo aparente
            return next.length === rooms.length ? current : next;
        });
    }

    return (
        <main className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Agenda</h1>
                    <p className="page-subtitle">Veja os horários de todas as salas e solicite uma reserva direto no calendário.</p>
                </div>
            </header>

            {rooms.length === 0 ? (
                <div className="empty-state">
                    <i className="fa-solid fa-door-closed" aria-hidden="true"></i>
                    <p>Nenhuma sala cadastrada.</p>
                </div>
            ) : (
                <section className="card room-schedule-card">
                    <div className="room-filter" role="group" aria-label="Filtrar salas">
                        {rooms.map((room, index) => (
                            <button
                                key={room.id}
                                type="button"
                                className="room-filter-chip"
                                aria-pressed={!hiddenIds.includes(room.id)}
                                style={{ '--room-color': roomColor(index) }}
                                onClick={() => toggleRoom(room.id)}
                            >
                                <span className="room-filter-dot" aria-hidden="true"></span>
                                {room.name}
                            </button>
                        ))}
                        {hiddenIds.length > 0 && (
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setHiddenIds([])}>
                                Mostrar todas
                            </button>
                        )}
                    </div>
                    <Suspense fallback={<p className="state">Carregando agenda...</p>}>
                        <RoomSchedule rooms={rooms} roomIds={hiddenIds.length ? visibleIds : undefined} user={user} />
                    </Suspense>
                </section>
            )}
        </main>
    );
}
