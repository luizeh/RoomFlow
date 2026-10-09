import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/layouts/admin.css';
import { confirmDialog, notify } from '../utils/alerts';

const links = [
    { to: '/admin', label: 'Painel', icon: 'fa-gauge', end: true },
    { to: '/admin/rooms', label: 'Salas', icon: 'fa-door-open' },
    { to: '/admin/users', label: 'Usuários', icon: 'fa-users' },
    { to: '/admin/reservations', label: 'Reservas', icon: 'fa-calendar-days' },
];

// Estrutura base das páginas do painel admin: menu lateral e conteúdo
export default function AdminLayout() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    async function handleLogout() {
        const confirmed = await confirmDialog({
            title: 'Sair da conta?',
            text: 'Você vai precisar entrar de novo para fazer reservas.',
            icon: 'question',
            confirmText: 'Sair',
            danger: true,
        });
        if (!confirmed) return;

        try {
            await logout();
            notify('Você saiu da conta.');
        } finally {
            navigate('/login');
        }
    }

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-top">
                    <Link to="/admin" className="brand">
                        <i className="fa-regular fa-calendar-check" aria-hidden="true"></i>
                        <span><strong>Room</strong>Flow</span>
                    </Link>
                    <span className="badge">Admin</span>
                </div>

                <nav className="admin-nav">
                    {links.map((link) => (
                        <NavLink key={link.to} to={link.to} end={link.end}>
                            <i className={`fa-solid ${link.icon}`} aria-hidden="true"></i>
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <Link to="/rooms" className="admin-back">
                        <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> <span>Voltar ao site</span>
                    </Link>
                    <div className="admin-user">
                        <span className="admin-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
                        <div className="admin-user-info">
                            <strong>{user?.name}</strong>
                            <span>{user?.email}</span>
                        </div>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout} title="Sair" aria-label="Sair">
                            <i className="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </aside>

            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
}
