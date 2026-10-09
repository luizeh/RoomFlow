import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createRoom, updateRoom } from '../../../services/admin';
import NotFound from '../../errors/NotFound';
import useRoom from '../../../hooks/useRoom';
import { notify } from '../../../utils/alerts';

const emptyRoom = { name: '', capacity: '', location: '', description: '' };
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // mesmo limite do backend (5 MB)

export default function RoomForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const { room: existingRoom, loading, error: loadError, notFound } = useRoom(id);
    const [form, setForm] = useState(emptyRoom);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageError, setImageError] = useState(null);
    const imageInputRef = useRef(null);

    // Libera a URL temporária da pré-visualização quando a imagem muda ou a tela fecha
    useEffect(() => {
        if (!imagePreview) return;
        return () => URL.revokeObjectURL(imagePreview);
    }, [imagePreview]);

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

    function handleImageChange(event) {
        const file = event.target.files?.[0];
        setImageError(null);
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setImageError('Selecione um arquivo de imagem.');
            event.target.value = '';
            return;
        }
        if (file.size > MAX_IMAGE_SIZE) {
            setImageError('A imagem deve ter no máximo 5 MB.');
            event.target.value = '';
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    function clearSelectedImage() {
        setImageFile(null);
        setImagePreview(null);
        setImageError(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError(null);

        const room = { ...form, capacity: Number(form.capacity), image: imageFile };
        try {
            if (isEditing) await updateRoom(id, room);
            else await createRoom(room);
            notify(isEditing ? 'Sala atualizada.' : 'Sala criada.');
            navigate('/admin/rooms');
        } catch (err) {
            const validationMessage = err.validationErrors
                ? Object.values(err.validationErrors).flat().join(' ')
                : null;
            setError(validationMessage || err.message || 'Erro ao salvar a sala.');
            setSaving(false);
        }
    }

    const currentImage = imagePreview || existingRoom?.image_url || null;

    if (loading) return <p className="state">Carregando sala...</p>;
    if (notFound) return <NotFound />;
    if (loadError) return <main className="page page-narrow"><p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>Ocorreu um erro: {loadError}</p></main>;

    return (
        <main className="page page-narrow">
            <Link to="/admin/rooms" className="back-link"><i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Voltar para salas</Link>
            <header className="page-header">
                <div>
                    <h1 className="page-title">{isEditing ? 'Editar sala' : 'Nova sala'}</h1>
                    <p className="page-subtitle">Informe os dados da sala de reunião.</p>
                </div>
            </header>
            {error && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{error}</p>}
            <form className="card form" onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="name">Nome</label>
                    <div className="input-icon">
                        <i className="fa-solid fa-door-open" aria-hidden="true"></i>
                        <input id="name" name="name" placeholder="Ex.: Sala Atlântico" value={form.name} onChange={handleChange} maxLength="100" required />
                    </div>
                </div>
                <div className="form-row">
                    <div className="field">
                        <label htmlFor="location">Local</label>
                        <div className="input-icon">
                            <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                            <input id="location" name="location" placeholder="Ex.: 3º andar" value={form.location} onChange={handleChange} maxLength="150" required />
                        </div>
                    </div>
                    <div className="field">
                        <label htmlFor="capacity">Capacidade</label>
                        <div className="input-icon">
                            <i className="fa-solid fa-user-group" aria-hidden="true"></i>
                            <input id="capacity" name="capacity" type="number" min="1" step="1" placeholder="Nº de pessoas" value={form.capacity} onChange={handleChange} required />
                        </div>
                    </div>
                </div>
                <div className="field">
                    <label htmlFor="image">Imagem</label>
                    <div className="image-upload">
                        <div className="image-upload-preview">
                            {currentImage ? (
                                <img src={currentImage} alt="Pré-visualização da sala" />
                            ) : (
                                <span className="room-image-placeholder"><i className="fa-regular fa-image" aria-hidden="true"></i></span>
                            )}
                        </div>
                        <div className="image-upload-body">
                            <div className="image-upload-actions">
                                <label htmlFor="image" className="btn btn-secondary btn-sm">
                                    <i className="fa-solid fa-upload" aria-hidden="true"></i> {currentImage ? 'Trocar imagem' : 'Escolher imagem'}
                                </label>
                                {imageFile && (
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={clearSelectedImage}>
                                        <i className="fa-solid fa-xmark" aria-hidden="true"></i> {existingRoom?.image_url ? 'Manter imagem atual' : 'Remover'}
                                    </button>
                                )}
                            </div>
                            <small className="field-hint">{imageFile ? imageFile.name : 'JPG, PNG, GIF ou WEBP, até 5 MB.'}</small>
                            {imageError && <small className="field-error" role="alert">{imageError}</small>}
                        </div>
                        <input ref={imageInputRef} id="image" name="image" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                    </div>
                </div>
                <div className="field">
                    <label htmlFor="description">Descrição</label>
                    <textarea id="description" name="description" placeholder="Equipamentos, observações..." value={form.description} onChange={handleChange} />
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Salvando...' : <><i className="fa-solid fa-check" aria-hidden="true"></i> Salvar sala</>}
                    </button>
                    <Link to="/admin/rooms" className="btn btn-secondary">Cancelar</Link>
                </div>
            </form>
        </main>
    );
}
