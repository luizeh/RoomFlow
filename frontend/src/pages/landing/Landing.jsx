import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/pages/landing.css';

// Página inicial do site: apresentação do RoomFlow com atalhos para entrar ou reservar
export default function Landing() {
    const { user, loading } = useAuth();

    return (
        <main className="landing">
            <section className="landing-hero">
                <div className="landing-brand">
                    <span className="landing-brand-icon"><i className="fa-regular fa-calendar-check" aria-hidden="true"></i></span>
                    <span className="landing-brand-name"><strong>Room</strong>Flow</span>
                </div>

                <p className="landing-eyebrow">
                    <i className="fa-solid fa-circle" aria-hidden="true"></i>
                    Reservas sem conflito
                </p>

                <h1 className="landing-title">Sua sala, no seu horário.</h1>

                <p className="landing-text">
                    Com o RoomFlow você encontra a sala ideal, confere a agenda em tempo real
                    e reserva em poucos cliques — sem planilhas, sem choque de horários.
                </p>

                {!loading && (
                    <div className="landing-actions">
                        {user ? (
                            <>
                                <Link to="/reservations/new" className="btn btn-primary btn-lg">
                                    <i className="fa-solid fa-plus" aria-hidden="true"></i> Nova reserva
                                </Link>
                                <Link to="/reservations" className="btn btn-primary btn-lg">
                                    <i className="fa-regular fa-calendar" aria-hidden="true"></i> Minhas reservas
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-primary btn-lg">
                                    <i className="fa-solid fa-right-to-bracket" aria-hidden="true"></i> Entrar
                                </Link>
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    <i className="fa-solid fa-user-plus" aria-hidden="true"></i> Criar conta
                                </Link>
                            </>
                        )}
                    </div>
                )}

                <div className="landing-actions">
                    <Link to="/rooms" className="btn btn-secondary btn-lg">
                        <i className="fa-solid fa-door-open" aria-hidden="true"></i> Ver salas <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                    </Link>
                    {user?.role === 'admin' && (
                        <Link to="/admin" className="btn btn-secondary btn-lg">
                            <i className="fa-solid fa-gauge" aria-hidden="true"></i> Painel admin <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                        </Link>
                    )}
                </div>
            </section>
        </main>
    );
}
