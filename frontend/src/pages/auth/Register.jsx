import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FieldError from '../../components/FieldError';
import '../../styles/pages/auth.css';

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

    if (loading) return <p className="state">Carregando...</p>;
    if (user) return <Navigate to="/rooms" replace />;

    return (
        <main className="auth-page auth-split">
            <section className="auth-panel">
                <div className="auth-brand">
                    <span className="auth-brand-icon"><i className="fa-regular fa-calendar-check" aria-hidden="true"></i></span>
                    <span className="auth-brand-name"><strong>Room</strong>Flow</span>
                </div>

                <h1 className="auth-title">Crie sua conta</h1>
                <p className="auth-subtitle">Comece a reservar salas de forma simples, rápida e eficiente.</p>

                {error && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{error}</p>}

                <form className="form" onSubmit={handleSubmit}>
                    <div className="field">
                        <label htmlFor="name">Nome completo</label>
                        <div className="input-icon">
                            <i className="fa-regular fa-user" aria-hidden="true"></i>
                            <input id="name" name="name" autoComplete="name" placeholder="Digite seu nome completo" value={form.name} onChange={handleChange} maxLength="255" required />
                        </div>
                        <FieldError messages={fieldErrors.name} />
                    </div>

                    <div className="field">
                        <label htmlFor="email">E-mail</label>
                        <div className="input-icon">
                            <i className="fa-regular fa-envelope" aria-hidden="true"></i>
                            <input id="email" name="email" type="email" autoComplete="email" placeholder="Digite seu e-mail" value={form.email} onChange={handleChange} maxLength="255" required />
                        </div>
                        <FieldError messages={fieldErrors.email} />
                    </div>

                    <div className="form-row">
                        <div className="field">
                            <label htmlFor="password">Senha</label>
                            <div className="input-icon">
                                <i className="fa-solid fa-lock" aria-hidden="true"></i>
                                <input id="password" name="password" type="password" autoComplete="new-password" placeholder="Digite sua senha" value={form.password} onChange={handleChange} minLength="8" required />
                            </div>
                            <FieldError messages={fieldErrors.password} />
                        </div>

                        <div className="field">
                            <label htmlFor="password_confirmation">Confirmar senha</label>
                            <div className="input-icon">
                                <i className="fa-solid fa-lock" aria-hidden="true"></i>
                                <input id="password_confirmation" name="password_confirmation" type="password" autoComplete="new-password" placeholder="Confirme sua senha" value={form.password_confirmation} onChange={handleChange} minLength="8" required />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={saving}>
                            {saving ? 'Cadastrando...' : <>Cadastrar <i className="fa-solid fa-arrow-right" aria-hidden="true"></i></>}
                        </button>
                    </div>
                </form>

                <p className="auth-footer">Já tem uma conta? <Link to="/login">Faça login</Link></p>
            </section>
        </main>
    );
}
