import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../../services/admin';
import { formatDateTime } from '../../../utils/datetime';
import '../../../styles/pages/dashboard.css';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        getDashboard()
            .then(setData)
            .catch((err) => setError(err.message || 'Erro ao carregar o painel.'));
    }, []);

    if (error) return <main className="page"><p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>Ocorreu um erro: {error}</p></main>;
    if (!data) return <p className="state">Carregando painel...</p>;

    const stats = [
        { label: 'Salas', value: data.rooms, icon: 'fa-door-open', to: '/admin/rooms' },
        { label: 'Usuários', value: data.users, icon: 'fa-users', to: '/admin/users' },
        { label: 'Reservas', value: data.reservations, icon: 'fa-calendar-days', to: '/admin/reservations' },
        { label: 'Começam hoje', value: data.reservations_today, icon: 'fa-clock' },
    ];

    return (
        <main className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Painel</h1>
                    <p className="page-subtitle">Visão geral das salas, usuários e reservas.</p>
                </div>
            </header>

            <div className="stat-grid">
                {stats.map((stat) => {
                    const content = (
                        <>
                            <div className="stat-card-top">
                                {stat.label}
                                <i className={`fa-solid ${stat.icon}`} aria-hidden="true"></i>
                            </div>
                            <span className="stat-card-value">{stat.value}</span>
                        </>
                    );
                    return stat.to ? (
                        <Link key={stat.label} to={stat.to} className="stat-card">{content}</Link>
                    ) : (
                        <div key={stat.label} className="stat-card">{content}</div>
                    );
                })}
            </div>

            <h2 className="section-title">Próximas reservas</h2>
            {data.upcoming_reservations.length === 0 ? (
                <div className="empty-state">
                    <i className="fa-regular fa-calendar" aria-hidden="true"></i>
                    <p>Nenhuma reserva futura.</p>
                </div>
            ) : (
                <ul className="upcoming-list">
                    {data.upcoming_reservations.map((reservation) => (
                        <li key={reservation.id} className="upcoming-item">
                            <span className="upcoming-time">
                                <i className="fa-regular fa-clock" aria-hidden="true"></i>
                                {formatDateTime(reservation.start_at)}
                            </span>
                            <div className="upcoming-info">
                                <strong>{reservation.room?.name}</strong>
                                <span>{reservation.user?.name}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
