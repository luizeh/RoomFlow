import RoomCard from '../components/RoomCard';
import useRooms from '../hooks/useRooms';

export default function Rooms() {
    const { rooms, loading, error } = useRooms();

    if (loading) return <p>Carregando salas...</p>;
    if (error) return <p role="alert">Ocorreu um erro: {error}</p>;

    return (
        <main>
            <h1>Salas de Reunião</h1>
            {rooms.length === 0 ? (
                <p>Nenhuma sala encontrada.</p>
            ) : (
                <div>
                    {rooms.map((room) => (
                        <RoomCard key={room.id} room={room} />
                    ))}
                </div>
            )}
        </main>
    );
}
