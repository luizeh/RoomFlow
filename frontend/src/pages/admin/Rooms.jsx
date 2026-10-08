import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminRooms } from '../../services/admin';
import useDeleteRoom from '../../hooks/useDeleteRoom';

export default function AdminRooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { remove, deletingId, error: deleteError } = useDeleteRoom((id) => {
        setRooms((current) => current.filter((room) => room.id !== id));
    });

    useEffect(() => {
        getAdminRooms()
            .then(setRooms)
            .catch((err) => setError(err.message || 'Erro ao carregar as salas.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Carregando salas...</p>;
    if (error) return <p role="alert">Ocorreu um erro: {error}</p>;

    return (
        <main>
            <p><Link to="/admin">Voltar para o painel</Link></p>
            <h1>Gerenciar salas</h1>
            <p><Link to="/admin/rooms/new">Criar sala</Link></p>
            {deleteError && <p role="alert">{deleteError}</p>}
            {rooms.length === 0 ? (
                <p>Nenhuma sala cadastrada.</p>
            ) : (
                <ul>
                    {rooms.map((room) => (
                        <li key={room.id}>
                            <strong>{room.name}</strong> ({room.location}, {room.capacity} pessoas){' '}
                            <Link to={`/admin/rooms/${room.id}/edit`}>Editar</Link>{' '}
                            <button type="button" onClick={() => remove(room)} disabled={deletingId === room.id}>
                                {deletingId === room.id ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
