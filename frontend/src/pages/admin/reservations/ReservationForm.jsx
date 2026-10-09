import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAdminReservation, updateAdminReservation } from '../../../services/admin';
import useRooms from '../../../hooks/useRooms';
import { toDateTimeInput } from '../../../utils/datetime';
import FieldError from '../../../components/FieldError';
import NotFound from '../../errors/NotFound';

export default function AdminReservationForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { rooms, loading: loadingRooms, error: roomsError } = useRooms();
    const [reservation, setReservation] = useState(null);
    const [form, setForm] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        getAdminReservation(id)
            .then((data) => {
                setReservation(data);
                setForm({
                    room_id: String(data.room_id),
                    start_at: toDateTimeInput(data.start_at),
                    end_at: toDateTimeInput(data.end_at),
                });
            })
            .catch((err) => {
                if (err.status === 404) setNotFound(true);
                else setLoadError(err.message || 'Erro ao carregar a reserva.');
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
            await updateAdminReservation(id, { ...form, room_id: Number(form.room_id) });
            navigate('/admin/reservations');
        } catch (err) {
            if (err.validationErrors) {
                setFieldErrors(err.validationErrors);
                setError('Corrija os campos destacados abaixo.');
            } else {
                setError(err.message || 'Erro ao salvar a reserva.');
            }
            setSaving(false);
        }
    }

    if (notFound) return <NotFound />;
    if (loadError || roomsError) return <main className="page page-narrow"><p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>Ocorreu um erro: {loadError || roomsError}</p></main>;
    if (!form || loadingRooms) return <p className="state">Carregando reserva...</p>;

    return (
        <main className="page page-narrow">
            <Link to="/admin/reservations" className="back-link"><i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Voltar para reservas</Link>
            <header className="page-header">
                <div>
                    <h1 className="page-title">Editar reserva #{reservation.id}</h1>
                    <p className="page-subtitle">Reservado por {reservation.user?.name} ({reservation.user?.email})</p>
                </div>
            </header>
            {error && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{error}</p>}
            <form className="card form" onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="room_id">Sala</label>
                    <div className="input-icon">
                        <i className="fa-solid fa-door-open" aria-hidden="true"></i>
                        <select id="room_id" name="room_id" value={form.room_id} onChange={handleChange} required>
                            {rooms.map((room) => (
                                <option key={room.id} value={room.id}>
                                    {room.name} ({room.location})
                                </option>
                            ))}
                        </select>
                        <i className="fa-solid fa-chevron-down input-chevron" aria-hidden="true"></i>
                    </div>
                    <FieldError messages={fieldErrors.room_id} />
                </div>
                <div className="form-row">
                    <div className="field">
                        <label htmlFor="start_at">Início</label>
                        <input id="start_at" name="start_at" type="datetime-local" value={form.start_at} onChange={handleChange} required />
                        <FieldError messages={fieldErrors.start_at} />
                    </div>
                    <div className="field">
                        <label htmlFor="end_at">Fim</label>
                        <input id="end_at" name="end_at" type="datetime-local" value={form.end_at} onChange={handleChange} min={form.start_at || undefined} required />
                        <FieldError messages={fieldErrors.end_at} />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Salvando...' : <><i className="fa-solid fa-check" aria-hidden="true"></i> Salvar reserva</>}
                    </button>
                    <Link to="/admin/reservations" className="btn btn-secondary">Cancelar</Link>
                </div>
            </form>
        </main>
    );
}
