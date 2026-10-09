import RoomCard from '../../components/RoomCard';
import useRooms from '../../hooks/useRooms';
import '../../styles/pages/rooms.css';

export default function Rooms() {
    const { rooms, loading, error } = useRooms();

    if (loading) return <p className="state">Carregando salas...</p>;
    if (error) return <main className="page"><p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>Ocorreu um erro: {error}</p></main>;

    return (
        <main className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Salas de reunião</h1>
                    <p className="page-subtitle">Escolha uma sala para ver os detalhes e fazer sua reserva.</p>
                </div>
            </header>
            {rooms.length === 0 ? (
                <div className="empty-state">
                    <i className="fa-solid fa-door-closed" aria-hidden="true"></i>
                    <p>Nenhuma sala encontrada.</p>
                </div>
            ) : (
                <div className="card-grid room-grid">
                    {rooms.map((room) => (
                        <RoomCard key={room.id} room={room} />
                    ))}
                </div>
            )}
        </main>
    );
}
