import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/layouts/app.css';

// Estrutura base das páginas do site: barra superior com navegação e conteúdo
export default function AppLayout() {
    const navigate = useNavigate();
    const { user, loading, logout } = useAuth();

    async function handleLogout() {
        try {
            await logout();
        } finally {
            navigate('/login');
        }
    }

    return (
        <div className="app-layout">
            <header className="app-header">
                <div className="app-header-inner">
                    <Link to="/rooms" className="brand">
                        <i className="fa-regular fa-calendar-check" aria-hidden="true"></i>
                        <span><strong>Room</strong>Flow</span>
                    </Link>

                    <nav className="app-nav">
                        <NavLink to="/rooms">Salas</NavLink>
                        {user && <NavLink to="/reservations">Minhas reservas</NavLink>}
                        {user && <NavLink to="/profile">Perfil</NavLink>}
                        {user?.role === 'admin' && <NavLink to="/admin">Painel admin</NavLink>}
                    </nav>

                    {!loading && (
                        <div className="app-user">
                            {user ? (
                                <>
                                    <span className="app-user-name">{user.name}</span>
                                    <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                                        <i className="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Sair
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="btn btn-ghost btn-sm">Entrar</Link>
                                    <Link to="/register" className="btn btn-primary btn-sm">Cadastrar</Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <div className="app-content">
                <Outlet />
            </div>
        </div>
    );
}
