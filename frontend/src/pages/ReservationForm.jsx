import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createReservation, updateReservation } from '../services/reservations';
import NotFound from './NotFound';
import useReservation from '../hooks/useReservation';
import useRooms from '../hooks/useRooms';
import { toDateTimeInput } from '../utils/datetime';
import FieldError from '../components/FieldError';

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

    if (loading || loadingRooms) return <p>Carregando...</p>;
    if (notFound) return <NotFound />;
    if (loadError) return <p role="alert">Ocorreu um erro: {loadError}</p>;
    if (roomsError) return <p role="alert">Ocorreu um erro: {roomsError}</p>;

    return (
        <main>
            <p><Link to="/reservations">Voltar para reservas</Link></p>
            <h1>{isEditing ? 'Editar reserva' : 'Criar reserva'}</h1>
            {error && <p role="alert">{error}</p>}
            <form onSubmit={handleSubmit}>
                <p>
                    <label htmlFor="room_id">Sala</label><br />
                    <select id="room_id" name="room_id" value={form.room_id} onChange={handleChange} required>
                        <option value="">Selecione uma sala</option>
                        {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                                {room.name} ({room.location})
                            </option>
                        ))}
                    </select>
                    <FieldError messages={fieldErrors.room_id} />
                </p>
                <p>
                    <label htmlFor="start_at">Início</label><br />
                    <input id="start_at" name="start_at" type="datetime-local" value={form.start_at} onChange={handleChange} required />
                    <FieldError messages={fieldErrors.start_at} />
                </p>
                <p>
                    <label htmlFor="end_at">Fim</label><br />
                    <input id="end_at" name="end_at" type="datetime-local" value={form.end_at} onChange={handleChange} min={form.start_at || undefined} required />
                    <FieldError messages={fieldErrors.end_at} />
                </p>
                <button type="submit" disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar reserva'}
                </button>
            </form>
        </main>
    );
}
