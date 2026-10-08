import { Link } from 'react-router-dom';

export default function RoomCard({ room }) {
    return (
        <div style={{ border: '1px solid #ccc', padding: '16px', margin: '10px 0', borderRadius: '8px' }}>
            <h3>{room.name}</h3>
            <p><strong>Local:</strong> {room.location}</p>
            <p><strong>Capacidade:</strong> {room.capacity} pessoas</p>
            {room.description && <p><em>{room.description}</em></p>}
            <p><Link to={`/rooms/${room.id}`}>Ver detalhes</Link></p>
        </div>
    );
}
