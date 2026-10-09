import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAdminUser, updateUser } from '../../../services/admin';
import { useAuth } from '../../../contexts/AuthContext';
import FieldError from '../../../components/FieldError';
import NotFound from '../../errors/NotFound';
import { notify } from '../../../utils/alerts';

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
            notify('Usuário atualizado.');
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
    if (loadError) return <main className="page page-narrow"><p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>Ocorreu um erro: {loadError}</p></main>;
    if (!form) return <p className="state">Carregando usuário...</p>;

    return (
        <main className="page page-narrow">
            <Link to="/admin/users" className="back-link"><i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Voltar para usuários</Link>
            <header className="page-header">
                <div>
                    <h1 className="page-title">Editar usuário</h1>
                    <p className="page-subtitle">Altere os dados e o papel de acesso da conta.</p>
                </div>
            </header>
            {error && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{error}</p>}
            <form className="card form" onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="name">Nome</label>
                    <div className="input-icon">
                        <i className="fa-regular fa-user" aria-hidden="true"></i>
                        <input id="name" name="name" value={form.name} onChange={handleChange} maxLength="255" required />
                    </div>
                    <FieldError messages={fieldErrors.name} />
                </div>
                <div className="field">
                    <label htmlFor="email">E-mail</label>
                    <div className="input-icon">
                        <i className="fa-regular fa-envelope" aria-hidden="true"></i>
                        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} maxLength="255" required />
                    </div>
                    <FieldError messages={fieldErrors.email} />
                </div>
                <div className="field">
                    <label htmlFor="role">Papel</label>
                    <div className="input-icon">
                        <i className="fa-solid fa-shield-halved" aria-hidden="true"></i>
                        <select id="role" name="role" value={form.role} onChange={handleChange} disabled={isMe}>
                            <option value="user">Usuário</option>
                            <option value="admin">Admin</option>
                        </select>
                        <i className="fa-solid fa-chevron-down input-chevron" aria-hidden="true"></i>
                    </div>
                    {isMe && <small className="field-hint">Você não pode alterar o seu próprio papel.</small>}
                    <FieldError messages={fieldErrors.role} />
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Salvando...' : <><i className="fa-solid fa-check" aria-hidden="true"></i> Salvar usuário</>}
                    </button>
                    <Link to="/admin/users" className="btn btn-secondary">Cancelar</Link>
                </div>
            </form>
        </main>
    );
}
