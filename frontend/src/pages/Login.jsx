import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FieldError from '../components/FieldError';

const emptyLogin = { email: '', password: '' };

export default function Login() {
    const navigate = useNavigate();
    const { user, loading, login } = useAuth();
    const [form, setForm] = useState(emptyLogin);
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

        try {
            await login(form);
            navigate('/rooms');
        } catch (err) {
            if (err.validationErrors) {
                setFieldErrors(err.validationErrors);
            } else {
                setError(err.message || 'Erro ao entrar.');
            }
            setSaving(false);
        }
    }

    if (loading) return <p>Carregando...</p>;
    if (user) return <Navigate to="/rooms" replace />;

    return (
        <main>
            <h1>Entrar</h1>
            {error && <p role="alert">{error}</p>}
            <form onSubmit={handleSubmit}>
                <p>
                    <label htmlFor="email">E-mail</label><br />
                    <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
                    <FieldError messages={fieldErrors.email} />
                </p>
                <p>
                    <label htmlFor="password">Senha</label><br />
                    <input id="password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={handleChange} required />
                    <FieldError messages={fieldErrors.password} />
                </p>
                <button type="submit" disabled={saving}>
                    {saving ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
            <p>Não tem conta? <Link to="/register">Cadastre-se</Link></p>
        </main>
    );
}
