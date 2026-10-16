import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import FieldError from '../../../components/FieldError';
import { getAdminSiteSettings, updateSiteSettings } from '../../../services/admin';
import { clearSiteSettingsCache } from '../../../services/site';
import { notify } from '../../../utils/alerts';
import defaultHeroImage from '../../../assets/images/landing-bg.png';
import '../../../styles/pages/site-settings.css';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // mesmo limite do backend (5 MB)

// Campos de texto, na mesma ordem e com os mesmos limites da SiteSettingRequest do backend
const FIELDS = [
    'hero_eyebrow', 'hero_title', 'hero_text',
    'phone', 'whatsapp', 'email', 'address', 'business_hours',
    'instagram_url', 'linkedin_url', 'facebook_url', 'footer_text',
];

const emptyForm = Object.fromEntries(FIELDS.map((field) => [field, '']));

// Painel admin: textos da landing page e dados de contato/redes do footer.
export default function SiteSettings() {
    const [form, setForm] = useState(emptyForm);
    const [currentImageUrl, setCurrentImageUrl] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [imageError, setImageError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const imageInputRef = useRef(null);

    function fillForm(settings) {
        setForm(Object.fromEntries(FIELDS.map((field) => [field, settings[field] ?? ''])));
        setCurrentImageUrl(settings.hero_image_url);
    }

    useEffect(() => {
        getAdminSiteSettings()
            .then(fillForm)
            .catch((err) => setError(err.message || 'Erro ao carregar o conteúdo do site.'))
            .finally(() => setLoading(false));
    }, []);

    // Libera a URL temporária da pré-visualização quando a imagem muda ou a tela fecha
    useEffect(() => {
        if (!imagePreview) return;
        return () => URL.revokeObjectURL(imagePreview);
    }, [imagePreview]);

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
        setRemoveImage(false);
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
        setFieldErrors({});

        try {
            const saved = await updateSiteSettings({
                ...form,
                hero_image: imageFile,
                remove_hero_image: removeImage,
            });
            fillForm(saved);
            clearSelectedImage();
            setRemoveImage(false);
            // A landing e o footer guardam o conteúdo em cache: limpa para mostrarem o novo
            clearSiteSettingsCache();
            notify('Conteúdo do site atualizado.');
        } catch (err) {
            if (err.validationErrors) {
                setFieldErrors(err.validationErrors);
                setError('Corrija os campos destacados abaixo.');
            } else {
                setError(err.message || 'Erro ao salvar.');
            }
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <p className="state">Carregando conteúdo do site...</p>;

    const previewImage = imagePreview || (!removeImage && currentImageUrl) || defaultHeroImage;
    const usingDefaultImage = !imagePreview && (removeImage || !currentImageUrl);

    // Campo de texto simples com ícone (a maioria dos campos do formulário)
    const textField = (name, label, { icon, placeholder, type = 'text', maxLength, hint } = {}) => (
        <div className="field">
            <label htmlFor={name}>{label}</label>
            <div className="input-icon">
                <i className={icon} aria-hidden="true"></i>
                <input id={name} name={name} type={type} value={form[name]} onChange={handleChange} placeholder={placeholder} maxLength={maxLength} />
            </div>
            {hint && <small className="field-hint">{hint}</small>}
            <FieldError messages={fieldErrors[name]} />
        </div>
    );

    return (
        <main className="page page-narrow">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Conteúdo do site</h1>
                    <p className="page-subtitle">Textos da página inicial e informações de contato que aparecem no rodapé.</p>
                </div>
                <Link to="/" target="_blank" className="btn btn-secondary">
                    <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> Ver página inicial
                </Link>
            </header>

            {error && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{error}</p>}

            <form className="form site-settings-form" onSubmit={handleSubmit}>
                <section className="card form">
                    <h2 className="section-title"><i className="fa-solid fa-house" aria-hidden="true"></i> Página inicial</h2>

                    {textField('hero_eyebrow', 'Selo acima do título', { icon: 'fa-solid fa-tag', placeholder: 'Ex.: Reservas sem conflito', maxLength: 60 })}

                    <div className="field">
                        <label htmlFor="hero_title">Título</label>
                        <input id="hero_title" name="hero_title" value={form.hero_title} onChange={handleChange} maxLength={120} required />
                        <FieldError messages={fieldErrors.hero_title} />
                    </div>

                    <div className="field">
                        <label htmlFor="hero_text">Descrição</label>
                        <textarea id="hero_text" name="hero_text" value={form.hero_text} onChange={handleChange} maxLength={600} placeholder="Um parágrafo curto apresentando o sistema." />
                        <FieldError messages={fieldErrors.hero_text} />
                    </div>

                    <div className="field">
                        <label htmlFor="hero_image">Imagem de fundo</label>
                        <div className="site-hero-preview">
                            <img src={previewImage} alt="Pré-visualização da imagem de fundo" />
                            {usingDefaultImage && <span className="badge">Imagem padrão</span>}
                        </div>
                        <div className="image-upload-actions">
                            <label htmlFor="hero_image" className="btn btn-secondary btn-sm">
                                <i className="fa-solid fa-upload" aria-hidden="true"></i> Trocar imagem
                            </label>
                            {imageFile && (
                                <button type="button" className="btn btn-secondary btn-sm" onClick={clearSelectedImage}>
                                    <i className="fa-solid fa-xmark" aria-hidden="true"></i> Descartar nova imagem
                                </button>
                            )}
                            {!imageFile && currentImageUrl && !removeImage && (
                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRemoveImage(true)}>
                                    <i className="fa-solid fa-rotate-left" aria-hidden="true"></i> Voltar para a imagem padrão
                                </button>
                            )}
                            {removeImage && (
                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRemoveImage(false)}>
                                    Manter imagem atual
                                </button>
                            )}
                        </div>
                        <small className="field-hint">
                            {imageFile ? imageFile.name : 'Imagem larga (ex.: 1920×1080), com a parte da esquerda mais escura para o texto ficar legível. Até 5 MB.'}
                        </small>
                        {imageError && <small className="field-error" role="alert">{imageError}</small>}
                        <FieldError messages={fieldErrors.hero_image} />
                        <input ref={imageInputRef} id="hero_image" name="hero_image" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                    </div>
                </section>

                <section className="card form">
                    <h2 className="section-title"><i className="fa-solid fa-address-book" aria-hidden="true"></i> Contato</h2>
                    <div className="form-row">
                        {textField('phone', 'Telefone', { icon: 'fa-solid fa-phone', placeholder: '(44) 3333-4444', maxLength: 30 })}
                        {textField('whatsapp', 'WhatsApp', { icon: 'fa-brands fa-whatsapp', placeholder: '(44) 99999-8888', maxLength: 30 })}
                    </div>
                    {textField('email', 'E-mail', { icon: 'fa-regular fa-envelope', type: 'email', placeholder: 'contato@empresa.com.br', maxLength: 150 })}
                    {textField('address', 'Endereço', { icon: 'fa-solid fa-location-dot', placeholder: 'Rua, número, cidade', maxLength: 200 })}
                    {textField('business_hours', 'Horário de funcionamento', { icon: 'fa-regular fa-clock', placeholder: 'Seg. a sex., das 8h às 18h', maxLength: 120 })}
                </section>

                <section className="card form">
                    <h2 className="section-title"><i className="fa-solid fa-share-nodes" aria-hidden="true"></i> Redes sociais</h2>
                    {textField('instagram_url', 'Instagram', { icon: 'fa-brands fa-instagram', type: 'url', placeholder: 'https://instagram.com/empresa' })}
                    {textField('linkedin_url', 'LinkedIn', { icon: 'fa-brands fa-linkedin', type: 'url', placeholder: 'https://linkedin.com/company/empresa' })}
                    {textField('facebook_url', 'Facebook', { icon: 'fa-brands fa-facebook', type: 'url', placeholder: 'https://facebook.com/empresa' })}
                </section>

                <section className="card form">
                    <h2 className="section-title"><i className="fa-solid fa-shoe-prints" aria-hidden="true"></i> Rodapé</h2>
                    <div className="field">
                        <label htmlFor="footer_text">Texto sobre a empresa</label>
                        <textarea id="footer_text" name="footer_text" value={form.footer_text} onChange={handleChange} maxLength={300} placeholder="Uma frase curta que aparece embaixo da marca no rodapé." />
                        <small className="field-hint">Campos vazios não aparecem no rodapé.</small>
                        <FieldError messages={fieldErrors.footer_text} />
                    </div>
                </section>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Salvando...' : <><i className="fa-solid fa-check" aria-hidden="true"></i> Salvar alterações</>}
                    </button>
                </div>
            </form>
        </main>
    );
}
