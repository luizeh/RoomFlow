import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useSiteSettings from '../../hooks/useSiteSettings';
import SiteFooter from '../../components/SiteFooter';
import defaultHeroImage from '../../assets/images/landing-bg.png';
import '../../styles/pages/landing.css';

// Textos usados se a API não responder (os mesmos que a migration grava no banco)
const DEFAULTS = {
    hero_eyebrow: 'Reservas sem conflito',
    hero_title: 'Sua sala, no seu horário.',
    hero_text: 'Com o RoomFlow você encontra a sala ideal, confere a agenda em tempo real e solicita sua reserva em poucos cliques — sem planilhas, sem choque de horários.',
};

// Página inicial do site: apresentação do RoomFlow com atalhos para entrar ou reservar.
// Os textos e a imagem de fundo são editados pelo admin em "Conteúdo do site".
export default function Landing() {
    const { user, loading } = useAuth();
    const { settings, loading: loadingSettings } = useSiteSettings();
    const content = settings ?? DEFAULTS;
    const heroImage = settings?.hero_image_url || defaultHeroImage;

    return (
        <div className="landing-page">
            <main className="landing" style={{ '--landing-image': `url("${heroImage}")` }}>
                {/* Espera o conteúdo do banco para não piscar o texto padrão antes do texto do admin */}
                {!loadingSettings && (
                    <section className="landing-hero">
                        <div className="landing-brand">
                            <span className="landing-brand-icon"><i className="fa-regular fa-calendar-check" aria-hidden="true"></i></span>
                            <span className="landing-brand-name"><strong>Room</strong>Flow</span>
                        </div>

                        {content.hero_eyebrow && (
                            <p className="landing-eyebrow">
                                <i className="fa-solid fa-circle" aria-hidden="true"></i>
                                {content.hero_eyebrow}
                            </p>
                        )}

                        <h1 className="landing-title">{content.hero_title}</h1>

                        {content.hero_text && <p className="landing-text">{content.hero_text}</p>}

                        {!loading && (
                            <div className="landing-actions">
                                {user ? (
                                    <>
                                        <Link to="/agenda" className="btn btn-primary btn-lg">
                                            <i className="fa-regular fa-calendar-plus" aria-hidden="true"></i> {user.role === 'admin' ? 'Nova reserva' : 'Solicitar reserva'}
                                        </Link>
                                        <Link to="/reservations" className="btn btn-primary btn-lg">
                                            <i className="fa-regular fa-calendar" aria-hidden="true"></i> Minhas reservas
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className="btn btn-primary btn-lg">
                                            <i className="fa-solid fa-right-to-bracket" aria-hidden="true"></i> Entrar
                                        </Link>
                                        <Link to="/register" className="btn btn-primary btn-lg">
                                            <i className="fa-solid fa-user-plus" aria-hidden="true"></i> Criar conta
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="landing-actions">
                            <Link to="/rooms" className="btn btn-secondary btn-lg">
                                <i className="fa-solid fa-door-open" aria-hidden="true"></i> Ver salas <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                            </Link>
                            {user?.role === 'admin' && (
                                <Link to="/admin" className="btn btn-secondary btn-lg">
                                    <i className="fa-solid fa-gauge" aria-hidden="true"></i> Painel admin <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                                </Link>
                            )}
                        </div>
                    </section>
                )}
            </main>
            <SiteFooter />
        </div>
    );
}
