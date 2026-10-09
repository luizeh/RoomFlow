import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FieldError from '../../components/FieldError';
import AuthBackdrop from '../../components/AuthBackdrop';
import '../../styles/pages/auth.css';

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

    if (loading) return <p className="state">Carregando...</p>;
    if (user) return <Navigate to="/rooms" replace />;

    return (
        <main className="auth-page auth-centered">
            <AuthBackdrop />

            <section className="auth-card">
                <div className="auth-brand">
                    <span className="auth-brand-icon"><i className="fa-regular fa-calendar-check" aria-hidden="true"></i></span>
                    <span className="auth-brand-name"><strong>Room</strong>Flow</span>
                </div>

                <h1 className="auth-title">Bem-vindo de volta</h1>
                <p className="auth-subtitle">Entre para reservar e gerenciar suas salas.</p>

                {error && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{error}</p>}

                <form className="form" onSubmit={handleSubmit}>
                    <div className="field">
                        <label htmlFor="email">E-mail</label>
                        <div className="input-icon">
                            <i className="fa-regular fa-envelope" aria-hidden="true"></i>
                            <input id="email" name="email" type="email" autoComplete="email" placeholder="Digite seu e-mail" value={form.email} onChange={handleChange} required />
                        </div>
                        <FieldError messages={fieldErrors.email} />
                    </div>

                    <div className="field">
                        <label htmlFor="password">Senha</label>
                        <div className="input-icon">
                            <i className="fa-solid fa-lock" aria-hidden="true"></i>
                            <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Digite sua senha" value={form.password} onChange={handleChange} required />
                        </div>
                        <FieldError messages={fieldErrors.password} />
                    </div>

                    <div className="form-actions">
                        <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={saving}>
                            {saving ? 'Entrando...' : <>Entrar <i className="fa-solid fa-arrow-right" aria-hidden="true"></i></>}
                        </button>
                    </div>
                </form>

                <p className="auth-footer">Não tem uma conta? <Link to="/register">Cadastre-se</Link></p>
            </section>
        </main>
    );
}
