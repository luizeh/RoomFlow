import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from '../../services/profile';
import FieldError from '../../components/FieldError';
import { notify } from '../../utils/alerts';

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const [form, setForm] = useState({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setFieldErrors({});

        // Só envia a senha se o usuário preencheu
        const data = { name: form.name, email: form.email };
        if (form.password) {
            data.password = form.password;
            data.password_confirmation = form.password_confirmation;
        }

        try {
            await updateProfile(data);
            await refreshUser();
            setForm((current) => ({ ...current, password: '', password_confirmation: '' }));
            notify('Perfil atualizado.');
        } catch (err) {
            if (err.validationErrors) {
                setFieldErrors(err.validationErrors);
                setError('Corrija os campos destacados abaixo.');
            } else {
                setError(err.message || 'Erro ao salvar o perfil.');
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="page page-narrow">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Meu perfil</h1>
                    <p className="page-subtitle">Atualize seus dados de acesso.</p>
                </div>
            </header>
            {error && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{error}</p>}
            <form className="card form" onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="name">Nome</label>
                    <div className="input-icon">
                        <i className="fa-regular fa-user" aria-hidden="true"></i>
                        <input id="name" name="name" autoComplete="name" value={form.name} onChange={handleChange} maxLength="255" required />
                    </div>
                    <FieldError messages={fieldErrors.name} />
                </div>
                <div className="field">
                    <label htmlFor="email">E-mail</label>
                    <div className="input-icon">
                        <i className="fa-regular fa-envelope" aria-hidden="true"></i>
                        <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} maxLength="255" required />
                    </div>
                    <FieldError messages={fieldErrors.email} />
                </div>
                <div className="form-row">
                    <div className="field">
                        <label htmlFor="password">Nova senha</label>
                        <div className="input-icon">
                            <i className="fa-solid fa-lock" aria-hidden="true"></i>
                            <input id="password" name="password" type="password" autoComplete="new-password" placeholder="Deixe em branco para manter" value={form.password} onChange={handleChange} minLength="8" />
                        </div>
                        <FieldError messages={fieldErrors.password} />
                    </div>
                    <div className="field">
                        <label htmlFor="password_confirmation">Confirmar nova senha</label>
                        <div className="input-icon">
                            <i className="fa-solid fa-lock" aria-hidden="true"></i>
                            <input id="password_confirmation" name="password_confirmation" type="password" autoComplete="new-password" placeholder="Repita a nova senha" value={form.password_confirmation} onChange={handleChange} minLength="8" />
                        </div>
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Salvando...' : <><i className="fa-solid fa-check" aria-hidden="true"></i> Salvar perfil</>}
                    </button>
                </div>
            </form>
        </main>
    );
}
