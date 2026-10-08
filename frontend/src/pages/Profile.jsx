import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/profile';
import FieldError from '../components/FieldError';

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const [form, setForm] = useState({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setMessage(null);
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
            setMessage('Perfil atualizado.');
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
        <main>
            <h1>Meu perfil</h1>
            {message && <p>{message}</p>}
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
                    <label htmlFor="password">Nova senha (deixe em branco para manter)</label><br />
                    <input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} minLength="8" />
                    <FieldError messages={fieldErrors.password} />
                </p>
                <p>
                    <label htmlFor="password_confirmation">Confirmar nova senha</label><br />
                    <input id="password_confirmation" name="password_confirmation" type="password" autoComplete="new-password" value={form.password_confirmation} onChange={handleChange} minLength="8" />
                </p>
                <button type="submit" disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar perfil'}
                </button>
            </form>
        </main>
    );
}
