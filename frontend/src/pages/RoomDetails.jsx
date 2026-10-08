import { Link, useParams } from 'react-router-dom';
import NotFound from './NotFound';
import useRoom from '../hooks/useRoom';
import { useAuth } from '../contexts/AuthContext';

export default function RoomDetails() {
    const { user } = useAuth();
    const { id } = useParams();
    const { room, loading, error: loadError, notFound } = useRoom(id);

    if (loading) return <p>Carregando sala...</p>;
    if (notFound) return <NotFound />;
    if (loadError) return <p role="alert">Ocorreu um erro: {loadError}</p>;
    if (!room) return <NotFound />;

    return (
        <main>
            <p><Link to="/rooms">Voltar para salas</Link></p>
            <h1>{room.name}</h1>
            <p><strong>Local:</strong> {room.location}</p>
            <p><strong>Capacidade:</strong> {room.capacity} pessoas</p>
            <p><strong>Descrição:</strong> {room.description || 'Sem descrição.'}</p>
            {user ? (
                <p><Link to={`/reservations/new?room=${room.id}`}>Reservar esta sala</Link></p>
            ) : (
                <p><Link to="/login">Entre</Link> para reservar esta sala.</p>
            )}
        </main>
    );
}
