import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAdminUser, updateUser } from '../../services/admin';
import { useAuth } from '../../contexts/AuthContext';
import FieldError from '../../components/FieldError';
import NotFound from '../NotFound';

export default function AdminUserForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, refreshUser } = useAuth();
    const isMe = Number(id) === currentUser.id;
    const [form, setForm] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        getAdminUser(id)
            .then((user) => setForm({ name: user.name, email: user.email, role: user.role }))
            .catch((err) => {
                if (err.status === 404) setNotFound(true);
                else setLoadError(err.message || 'Erro ao carregar o usuário.');
            });
    }, [id]);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setFieldErrors({});

        try {
            await updateUser(id, form);
            // Se o admin editou a própria conta, atualiza o nome no topo
            if (isMe) await refreshUser();
            navigate('/admin/users');
        } catch (err) {
            if (err.validationErrors) {
                setFieldErrors(err.validationErrors);
                setError('Corrija os campos destacados abaixo.');
            } else {
                setError(err.message || 'Erro ao salvar o usuário.');
            }
            setSaving(false);
        }
    }

    if (notFound) return <NotFound />;
    if (loadError) return <p role="alert">Ocorreu um erro: {loadError}</p>;
    if (!form) return <p>Carregando usuário...</p>;

    return (
        <main>
            <p><Link to="/admin/users">Voltar para usuários</Link></p>
            <h1>Editar usuário</h1>
            {error && <p role="alert">{error}</p>}
            <form onSubmit={handleSubmit}>
                <p>
                    <label htmlFor="name">Nome</label><br />
                    <input id="name" name="name" value={form.name} onChange={handleChange} maxLength="255" required />
                    <FieldError messages={fieldErrors.name} />
                </p>
                <p>
                    <label htmlFor="email">E-mail</label><br />
                    <input id="email" name="email" type="email" value={form.email} onChange={handleChange} maxLength="255" required />
                    <FieldError messages={fieldErrors.email} />
                </p>
                <p>
                    <label htmlFor="role">Papel</label><br />
                    <select id="role" name="role" value={form.role} onChange={handleChange} disabled={isMe}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                    </select>
                    {isMe && <><br /><small>Você não pode alterar o seu próprio papel.</small></>}
                    <FieldError messages={fieldErrors.role} />
                </p>
                <button type="submit" disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar usuário'}
                </button>
            </form>
        </main>
    );
}
