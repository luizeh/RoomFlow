import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../services/admin';
import { formatDateTime } from '../../utils/datetime';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        getDashboard()
            .then(setData)
            .catch((err) => setError(err.message || 'Erro ao carregar o painel.'));
    }, []);

    if (error) return <p role="alert">Ocorreu um erro: {error}</p>;
    if (!data) return <p>Carregando painel...</p>;

    return (
        <main>
            <h1>Painel do administrador</h1>
            <ul>
                <li><Link to="/admin/rooms">Salas</Link>: {data.rooms}</li>
                <li><Link to="/admin/users">Usuários</Link>: {data.users}</li>
                <li><Link to="/admin/reservations">Reservas</Link>: {data.reservations}</li>
                <li>Reservas que começam hoje: {data.reservations_today}</li>
            </ul>

            <h2>Próximas reservas</h2>
            {data.upcoming_reservations.length === 0 ? (
                <p>Nenhuma reserva futura.</p>
            ) : (
                <ul>
                    {data.upcoming_reservations.map((reservation) => (
                        <li key={reservation.id}>
                            {formatDateTime(reservation.start_at)}: {reservation.room?.name} ({reservation.user?.name})
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
