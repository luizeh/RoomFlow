import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Componente de teste: menu, usuário logado e botão de logout
export default function UserStatus() {
    const navigate = useNavigate();
    const { user, loading, logout } = useAuth();

    async function handleLogout() {
        try {
            await logout();
        } finally {
            navigate('/login');
        }
    }

    if (loading) return null;

    if (!user) {
        return (
            <nav>
                <Link to="/rooms">Salas</Link> | <Link to="/login">Entrar</Link> | <Link to="/register">Cadastrar</Link>
            </nav>
        );
    }

    return (
        <div>
            <nav>
                <Link to="/rooms">Salas</Link> | <Link to="/reservations">Minhas reservas</Link> | <Link to="/profile">Perfil</Link>
                {user.role === 'admin' && <> | <Link to="/admin">Painel admin</Link></>}
            </nav>
            <p>Logado como: {user.name} ({user.email})</p>
            <button type="button" onClick={handleLogout}>Sair</button>
        </div>
    );
}
