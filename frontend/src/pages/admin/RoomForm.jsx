import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createRoom, updateRoom } from '../../services/admin';
import NotFound from '../NotFound';
import useRoom from '../../hooks/useRoom';

const emptyRoom = { name: '', capacity: '', location: '', description: '' };

export default function RoomForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const { room: existingRoom, loading, error: loadError, notFound } = useRoom(id);
    const [form, setForm] = useState(emptyRoom);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!existingRoom) return;
        setForm({
            name: existingRoom.name ?? '',
            capacity: String(existingRoom.capacity ?? ''),
            location: existingRoom.location ?? '',
            description: existingRoom.description ?? '',
        });
    }, [existingRoom]);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError(null);

        const room = { ...form, capacity: Number(form.capacity) };
        try {
            if (isEditing) await updateRoom(id, room);
            else await createRoom(room);
            navigate('/admin/rooms');
        } catch (err) {
            const validationMessage = err.validationErrors
                ? Object.values(err.validationErrors).flat().join(' ')
                : null;
            setError(validationMessage || err.message || 'Erro ao salvar a sala.');
            setSaving(false);
        }
    }

    if (loading) return <p>Carregando sala...</p>;
    if (notFound) return <NotFound />;
    if (loadError) return <p role="alert">Ocorreu um erro: {loadError}</p>;

    return (
        <main>
            <p><Link to="/admin/rooms">Voltar para salas</Link></p>
            <h1>{isEditing ? 'Editar sala' : 'Criar sala'}</h1>
            {error && <p role="alert">{error}</p>}
            <form onSubmit={handleSubmit}>
                <p>
                    <label htmlFor="name">Nome</label><br />
                    <input id="name" name="name" value={form.name} onChange={handleChange} maxLength="100" required />
                </p>
                <p>
                    <label htmlFor="location">Local</label><br />
                    <input id="location" name="location" value={form.location} onChange={handleChange} maxLength="150" required />
                </p>
                <p>
                    <label htmlFor="capacity">Capacidade</label><br />
                    <input id="capacity" name="capacity" type="number" min="1" step="1" value={form.capacity} onChange={handleChange} required />
                </p>
                <p>
                    <label htmlFor="description">Descrição</label><br />
                    <textarea id="description" name="description" value={form.description} onChange={handleChange} />
                </p>
                <button type="submit" disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar sala'}
                </button>
            </form>
        </main>
    );
}
