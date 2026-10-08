import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteUser, getUsers, updateUser } from '../../services/admin';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminUsers() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [busyId, setBusyId] = useState(null);

    useEffect(() => {
        getUsers()
            .then(setUsers)
            .catch((err) => setError(err.message || 'Erro ao carregar os usuários.'))
            .finally(() => setLoading(false));
    }, []);

    async function handleRoleChange(user, role) {
        setBusyId(user.id);
        setActionError(null);
        try {
            const updated = await updateUser(user.id, { role });
            setUsers((current) => current.map((u) => (u.id === user.id ? { ...u, ...updated } : u)));
        } catch (err) {
            setActionError(err.message || 'Erro ao alterar o papel do usuário.');
        } finally {
            setBusyId(null);
        }
    }

    async function handleDelete(user) {
        if (!window.confirm(`Excluir o usuário "${user.name}"? As reservas dele também serão excluídas.`)) return;

        setBusyId(user.id);
        setActionError(null);
        try {
            await deleteUser(user.id);
            setUsers((current) => current.filter((u) => u.id !== user.id));
        } catch (err) {
            setActionError(err.message || 'Erro ao excluir o usuário.');
        } finally {
            setBusyId(null);
        }
    }

    if (loading) return <p>Carregando usuários...</p>;
    if (error) return <p role="alert">Ocorreu um erro: {error}</p>;

    return (
        <main>
            <p><Link to="/admin">Voltar para o painel</Link></p>
            <h1>Gerenciar usuários</h1>
            {actionError && <p role="alert">{actionError}</p>}
            <ul>
                {users.map((user) => {
                    const isMe = user.id === currentUser.id;
                    return (
                        <li key={user.id}>
                            <strong>{user.name}</strong> ({user.email}), {user.reservations_count} reserva(s){' '}
                            <select
                                value={user.role}
                                onChange={(event) => handleRoleChange(user, event.target.value)}
                                disabled={isMe || busyId === user.id}
                            >
                                <option value="user">user</option>
                                <option value="admin">admin</option>
                            </select>{' '}
                            <Link to={`/admin/users/${user.id}/edit`}>Editar</Link>{' '}
                            <button type="button" onClick={() => handleDelete(user)} disabled={isMe || busyId === user.id}>
                                Excluir
                            </button>
                            {isMe && ' (você)'}
                        </li>
                    );
                })}
            </ul>
        </main>
    );
}
