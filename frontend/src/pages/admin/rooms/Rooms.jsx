import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminRooms } from '../../../services/admin';
import useDeleteRoom from '../../../hooks/useDeleteRoom';

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

    if (loading) return <p className="state">Carregando salas...</p>;
    if (error) return <main className="page"><p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>Ocorreu um erro: {error}</p></main>;

    return (
        <main className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Salas</h1>
                    <p className="page-subtitle">Cadastre, edite e remova as salas de reunião.</p>
                </div>
                <Link to="/admin/rooms/new" className="btn btn-primary">
                    <i className="fa-solid fa-plus" aria-hidden="true"></i> Nova sala
                </Link>
            </header>
            {deleteError && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{deleteError}</p>}
            {rooms.length === 0 ? (
                <div className="empty-state">
                    <i className="fa-solid fa-door-closed" aria-hidden="true"></i>
                    <p>Nenhuma sala cadastrada.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Sala</th>
                                <th>Local</th>
                                <th>Capacidade</th>
                                <th><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room) => (
                                <tr key={room.id}>
                                    <td className="table-primary">
                                        <div className="table-room">
                                            <span className="table-room-thumb">
                                                {room.image_url ? (
                                                    <img src={room.image_url} alt="" loading="lazy" />
                                                ) : (
                                                    <i className="fa-solid fa-door-open" aria-hidden="true"></i>
                                                )}
                                            </span>
                                            {room.name}
                                        </div>
                                    </td>
                                    <td className="table-secondary">{room.location}</td>
                                    <td className="table-secondary">{room.capacity} pessoas</td>
                                    <td>
                                        <div className="table-actions">
                                            <Link to={`/admin/rooms/${room.id}/edit`} className="btn btn-secondary btn-sm">
                                                <i className="fa-solid fa-pen" aria-hidden="true"></i> Editar
                                            </Link>
                                            <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(room)} disabled={deletingId === room.id}>
                                                <i className="fa-regular fa-trash-can" aria-hidden="true"></i> {deletingId === room.id ? 'Excluindo...' : 'Excluir'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
