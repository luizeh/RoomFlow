import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteUser, getUsers, updateUser } from '../../../services/admin';
import { useAuth } from '../../../contexts/AuthContext';

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

    if (loading) return <p className="state">Carregando usuários...</p>;
    if (error) return <main className="page"><p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>Ocorreu um erro: {error}</p></main>;

    return (
        <main className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Usuários</h1>
                    <p className="page-subtitle">Gerencie as contas e os papéis de acesso.</p>
                </div>
            </header>
            {actionError && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{actionError}</p>}
            <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Usuário</th>
                            <th>Reservas</th>
                            <th>Papel</th>
                            <th><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            const isMe = user.id === currentUser.id;
                            return (
                                <tr key={user.id}>
                                    <td>
                                        <div className="table-primary">
                                            {user.name} {isMe && <span className="badge">você</span>}
                                        </div>
                                        <div className="table-secondary">{user.email}</div>
                                    </td>
                                    <td className="table-secondary">{user.reservations_count}</td>
                                    <td>
                                        <select
                                            value={user.role}
                                            onChange={(event) => handleRoleChange(user, event.target.value)}
                                            disabled={isMe || busyId === user.id}
                                            aria-label={`Papel de ${user.name}`}
                                        >
                                            <option value="user">Usuário</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <Link to={`/admin/users/${user.id}/edit`} className="btn btn-secondary btn-sm">
                                                <i className="fa-solid fa-pen" aria-hidden="true"></i> Editar
                                            </Link>
                                            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(user)} disabled={isMe || busyId === user.id}>
                                                <i className="fa-regular fa-trash-can" aria-hidden="true"></i> Excluir
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
