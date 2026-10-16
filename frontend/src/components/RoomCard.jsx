import { Link } from 'react-router-dom';

export default function RoomCard({ room }) {
    return (
        <article className="card room-card">
            <div className="room-card-media">
                {room.image_url ? (
                    <img src={room.image_url} alt={`Foto da sala ${room.name}`} loading="lazy" />
                ) : (
                    <span className="room-image-placeholder"><i className="fa-solid fa-door-open" aria-hidden="true"></i></span>
                )}
            </div>
            <div className="room-card-body">
                <h3 className="room-card-title">{room.name}</h3>
                <ul className="meta-list">
                    <li><i className="fa-solid fa-location-dot" aria-hidden="true"></i>{room.location}</li>
                    <li><i className="fa-solid fa-user-group" aria-hidden="true"></i>{room.capacity} pessoas</li>
                </ul>
                {room.description && <p className="room-card-description">{room.description}</p>}
                <div className="card-actions">
                    {/* #agenda: abre a página da sala já rolada até a agenda */}
                    <Link to={`/rooms/${room.id}#agenda`} className="btn btn-primary">
                        <i className="fa-regular fa-calendar-plus" aria-hidden="true"></i> Solicitar horário
                    </Link>
                    <Link to={`/rooms/${room.id}`} className="btn btn-secondary">
                        Detalhes <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                    </Link>
                </div>
            </div>
        </article>
    );
}
