import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAdminReservation, updateAdminReservation } from '../../services/admin';
import useRooms from '../../hooks/useRooms';
import { toDateTimeInput } from '../../utils/datetime';
import FieldError from '../../components/FieldError';
import NotFound from '../NotFound';

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
    if (loadError) return <p role="alert">Ocorreu um erro: {loadError}</p>;
    if (roomsError) return <p role="alert">Ocorreu um erro: {roomsError}</p>;
    if (!form || loadingRooms) return <p>Carregando reserva...</p>;

    return (
        <main>
            <p><Link to="/admin/reservations">Voltar para reservas</Link></p>
            <h1>Editar reserva #{reservation.id}</h1>
            <p><strong>Reservado por:</strong> {reservation.user?.name} ({reservation.user?.email})</p>
            {error && <p role="alert">{error}</p>}
            <form onSubmit={handleSubmit}>
                <p>
                    <label htmlFor="room_id">Sala</label><br />
                    <select id="room_id" name="room_id" value={form.room_id} onChange={handleChange} required>
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
