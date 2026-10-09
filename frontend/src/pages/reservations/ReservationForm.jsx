import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createReservation, updateReservation } from '../../services/reservations';
import NotFound from '../errors/NotFound';
import useReservation from '../../hooks/useReservation';
import useRooms from '../../hooks/useRooms';
import { toDateTimeInput } from '../../utils/datetime';
import FieldError from '../../components/FieldError';
import { notify } from '../../utils/alerts';

const emptyReservation = { room_id: '', start_at: '', end_at: '' };

export default function ReservationForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEditing = Boolean(id);
    const { reservation: existingReservation, loading, error: loadError, notFound } = useReservation(id);
    const { rooms, loading: loadingRooms, error: roomsError } = useRooms();
    // /reservations/new?room=3 já abre com a sala 3 selecionada
    const [form, setForm] = useState({ ...emptyReservation, room_id: searchParams.get('room') ?? '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (!existingReservation) return;
        setForm({
            room_id: String(existingReservation.room_id ?? ''),
            start_at: toDateTimeInput(existingReservation.start_at),
            end_at: toDateTimeInput(existingReservation.end_at),
        });
    }, [existingReservation]);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setFieldErrors({});

        const reservation = {
            ...form,
            room_id: Number(form.room_id),
        };
        try {
            const savedReservation = isEditing
                ? await updateReservation(id, reservation)
                : await createReservation(reservation);
            notify(isEditing ? 'Reserva atualizada.' : 'Reserva confirmada!');
            navigate(`/reservations/${savedReservation.id}`);
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

    if (loading || loadingRooms) return <p className="state">Carregando...</p>;
    if (notFound) return <NotFound />;
    if (loadError || roomsError) return <main className="page page-narrow"><p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>Ocorreu um erro: {loadError || roomsError}</p></main>;

    return (
        <main className="page page-narrow">
            <Link to="/reservations" className="back-link"><i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Voltar para reservas</Link>
            <header className="page-header">
                <div>
                    <h1 className="page-title">{isEditing ? 'Editar reserva' : 'Nova reserva'}</h1>
                    <p className="page-subtitle">Escolha a sala e o horário da reunião.</p>
                </div>
            </header>
            {error && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{error}</p>}
            <form className="card form" onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="room_id">Sala</label>
                    <div className="input-icon">
                        <i className="fa-solid fa-door-open" aria-hidden="true"></i>
                        <select id="room_id" name="room_id" value={form.room_id} onChange={handleChange} required>
                            <option value="">Selecione uma sala</option>
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
                    <Link to="/reservations" className="btn btn-secondary">Cancelar</Link>
                </div>
            </form>
        </main>
    );
}
