import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FieldError from '../components/FieldError';

const emptyRegister = { name: '', email: '', password: '', password_confirmation: '' };

export default function Register() {
    const navigate = useNavigate();
    const { user, loading, register } = useAuth();
    const [form, setForm] = useState(emptyRegister);
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
            await register(form);
            navigate('/rooms');
        } catch (err) {
            if (err.validationErrors) {
                setFieldErrors(err.validationErrors);
                setError('Corrija os campos destacados abaixo.');
            } else {
                setError(err.message || 'Erro ao criar a conta.');
            }
            setSaving(false);
        }
    }

    if (loading) return <p>Carregando...</p>;
    if (user) return <Navigate to="/rooms" replace />;

    return (
        <main>
            <h1>Criar conta</h1>
            {error && <p role="alert">{error}</p>}
            <form onSubmit={handleSubmit}>
                <p>
                    <label htmlFor="name">Nome</label><br />
                    <input id="name" name="name" autoComplete="name" value={form.name} onChange={handleChange} maxLength="255" required />
                    <FieldError messages={fieldErrors.name} />
                </p>
                <p>
                    <label htmlFor="email">E-mail</label><br />
                    <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} maxLength="255" required />
                    <FieldError messages={fieldErrors.email} />
                </p>
                <p>
                    <label htmlFor="password">Senha</label><br />
                    <input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} minLength="8" required />
                    <FieldError messages={fieldErrors.password} />
                </p>
                <p>
                    <label htmlFor="password_confirmation">Confirmar senha</label><br />
                    <input id="password_confirmation" name="password_confirmation" type="password" autoComplete="new-password" value={form.password_confirmation} onChange={handleChange} minLength="8" required />
                </p>
                <button type="submit" disabled={saving}>
                    {saving ? 'Criando conta...' : 'Criar conta'}
                </button>
            </form>
            <p>Já tem conta? <Link to="/login">Entrar</Link></p>
        </main>
    );
}
