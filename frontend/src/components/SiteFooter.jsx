import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useSiteSettings from '../hooks/useSiteSettings';
import '../styles/footer.css';

// Só os números, para os links tel: e wa.me
const digits = (value) => value.replace(/\D/g, '');

// wa.me precisa do código do país: se o número não tiver (até 11 dígitos), assume Brasil (55)
function whatsappUrl(value) {
    const number = digits(value);
    return `https://wa.me/${number.length <= 11 ? `55${number}` : number}`;
}

const YEAR = new Date().getFullYear();

const SOCIALS = [
    { field: 'instagram_url', label: 'Instagram', icon: 'fa-brands fa-instagram' },
    { field: 'linkedin_url', label: 'LinkedIn', icon: 'fa-brands fa-linkedin-in' },
    { field: 'facebook_url', label: 'Facebook', icon: 'fa-brands fa-facebook-f' },
];

// Rodapé do site (landing e páginas do AppLayout). O conteúdo vem do banco e é editado
// pelo admin em "Conteúdo do site"; campos vazios simplesmente não aparecem.
export default function SiteFooter() {
    const { user } = useAuth();
    const { settings } = useSiteSettings();
    const s = settings ?? {};

    const contacts = [
        s.phone && { icon: 'fa-solid fa-phone', text: s.phone, href: `tel:${digits(s.phone)}` },
        s.whatsapp && { icon: 'fa-brands fa-whatsapp', text: s.whatsapp, href: whatsappUrl(s.whatsapp), external: true },
        s.email && { icon: 'fa-regular fa-envelope', text: s.email, href: `mailto:${s.email}` },
        s.address && { icon: 'fa-solid fa-location-dot', text: s.address },
        s.business_hours && { icon: 'fa-regular fa-clock', text: s.business_hours },
    ].filter(Boolean);

    const socials = SOCIALS.filter((social) => s[social.field]);

    return (
        <footer className="site-footer">
            <div className="site-footer-inner">
                <div className="site-footer-brand">
                    <Link to="/" className="brand">
                        <i className="fa-regular fa-calendar-check" aria-hidden="true"></i>
                        <span><strong>Room</strong>Flow</span>
                    </Link>
                    {s.footer_text && <p>{s.footer_text}</p>}
                    {socials.length > 0 && (
                        <ul className="site-footer-socials">
                            {socials.map((social) => (
                                <li key={social.field}>
                                    <a href={s[social.field]} target="_blank" rel="noreferrer" aria-label={social.label} title={social.label}>
                                        <i className={social.icon} aria-hidden="true"></i>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <nav className="site-footer-col" aria-label="Links do rodapé">
                    <h2>Navegação</h2>
                    <ul>
                        <li><Link to="/rooms">Salas</Link></li>
                        {user ? (
                            <>
                                <li><Link to="/agenda">Agenda</Link></li>
                                <li><Link to="/reservations">Minhas reservas</Link></li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/login">Entrar</Link></li>
                                <li><Link to="/register">Criar conta</Link></li>
                            </>
                        )}
                    </ul>
                </nav>

                {contacts.length > 0 && (
                    <div className="site-footer-col">
                        <h2>Contato</h2>
                        <ul>
                            {contacts.map((contact) => (
                                <li key={contact.icon}>
                                    <i className={contact.icon} aria-hidden="true"></i>
                                    {contact.href ? (
                                        <a href={contact.href} {...(contact.external ? { target: '_blank', rel: 'noreferrer' } : {})}>{contact.text}</a>
                                    ) : (
                                        <span>{contact.text}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="site-footer-bottom">
                <p>© {YEAR} RoomFlow. Todos os direitos reservados.</p>
            </div>
        </footer>
    );
}
