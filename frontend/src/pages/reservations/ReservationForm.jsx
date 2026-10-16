import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createReservation, updateReservation } from '../../services/reservations';
import NotFound from '../errors/NotFound';
import useReservation from '../../hooks/useReservation';
import useRooms from '../../hooks/useRooms';
import { toDateTimeInput } from '../../utils/datetime';
import FieldError from '../../components/FieldError';
import ParticipantPicker from '../../components/ParticipantPicker';
import { useAuth } from '../../contexts/AuthContext';
import { notify } from '../../utils/alerts';

const emptyReservation = { room_id: '', title: '', start_at: '', end_at: '' };

export default function ReservationForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const isEditing = Boolean(id);
    const isAdmin = user.role === 'admin';
    const { reservation: existingReservation, loading, error: loadError, notFound } = useReservation(id);
    const { rooms, loading: loadingRooms, error: roomsError } = useRooms();
    // /reservations/new?room=3 já abre com a sala 3 selecionada
    const [form, setForm] = useState({ ...emptyReservation, room_id: searchParams.get('room') ?? '' });
    const [participants, setParticipants] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (!existingReservation) return;
        setForm({
            room_id: String(existingReservation.room_id ?? ''),
            title: existingReservation.title ?? '',
            start_at: toDateTimeInput(existingReservation.start_at),
            end_at: toDateTimeInput(existingReservation.end_at),
        });
        setParticipants(existingReservation.participants ?? []);
    }, [existingReservation]);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }

    // Cliente envia solicitação (fica pendente); admin reserva direto
    function successMessage(saved) {
        if (!isEditing) return isAdmin ? 'Reserva confirmada!' : 'Solicitação enviada! Aguarde a aprovação.';
        if (saved.status === 'pending' && existingReservation?.status !== 'pending') {
            return 'Reserva atualizada. A sala ou o horário mudou, então ela voltou para aprovação.';
        }
        return 'Reserva atualizada.';
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setFieldErrors({});

        const reservation = {
            ...form,
            room_id: Number(form.room_id),
            title: form.title.trim() || null,
            participant_ids: participants.map((participant) => participant.id),
        };
        try {
            const savedReservation = isEditing
                ? await updateReservation(id, reservation)
                : await createReservation(reservation);
            notify(successMessage(savedReservation));
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
    // Convidado não edita a reserva (o backend também bloqueia)
    if (existingReservation && existingReservation.user_id !== user.id && user.role !== 'admin') {
        return <main className="page page-narrow"><p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>Só quem criou a reserva pode editá-la.</p></main>;
    }

    // Erros de participantes vêm por posição (participant_ids.0, participant_ids.1...)
    const participantErrors = Object.entries(fieldErrors)
        .filter(([key]) => key.startsWith('participant_ids'))
        .flatMap(([, messages]) => messages);

    return (
        <main className="page page-narrow">
            <Link to="/reservations" className="back-link"><i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Voltar para reservas</Link>
            <header className="page-header">
                <div>
                    <h1 className="page-title">{isEditing ? 'Editar reserva' : isAdmin ? 'Nova reserva' : 'Solicitar reserva'}</h1>
                    <p className="page-subtitle">Escolha a sala, o horário e quem vai participar da reunião.</p>
                </div>
            </header>
            {!isAdmin && !isEditing && (
                <div className="schedule-hint">
                    <i className="fa-regular fa-lightbulb" aria-hidden="true"></i>
                    <p>
                        Sua solicitação vai para um administrador aprovar, e você recebe a resposta por e-mail.
                        Para ver os horários livres antes de escolher, abra a <Link to="/agenda">agenda</Link>.
                    </p>
                </div>
            )}
            {!isAdmin && isEditing && existingReservation?.status === 'approved' && (
                <p className="alert alert-warning" role="status">
                    <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                    Esta reserva já foi aprovada. Se você mudar a sala ou o horário, ela volta para aprovação.
                </p>
            )}
            {error && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{error}</p>}
            <form className="card form" onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="title">Título <span className="field-hint">(opcional)</span></label>
                    <input id="title" name="title" type="text" value={form.title} onChange={handleChange} maxLength={120} placeholder="Ex.: Reunião de planejamento" />
                    <FieldError messages={fieldErrors.title} />
                </div>
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
                <div className="field">
                    <label htmlFor="participant_search">Convidados</label>
                    <ParticipantPicker value={participants} onChange={setParticipants} />
                    <span className="field-hint">Os convidados veem a reserva na lista deles, mas só você pode editá-la.</span>
                    <FieldError messages={participantErrors} />
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving
                            ? 'Salvando...'
                            : !isAdmin && !isEditing
                                ? <><i className="fa-regular fa-paper-plane" aria-hidden="true"></i> Enviar solicitação</>
                                : <><i className="fa-solid fa-check" aria-hidden="true"></i> Salvar reserva</>}
                    </button>
                    <Link to="/reservations" className="btn btn-secondary">Cancelar</Link>
                </div>
            </form>
        </main>
    );
}
