import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../services/notifications';
import { formatDateTime } from '../utils/datetime';

// De quanto em quanto tempo busca avisos novos enquanto a página está aberta
const REFRESH_INTERVAL = 60 * 1000;

const ICONS = {
    approved: 'fa-solid fa-circle-check',
    rejected: 'fa-solid fa-circle-xmark',
};

// "agora", "há 5 min", "há 2 h", "há 3 dias" ou a data, para avisos mais antigos
function timeAgo(value) {
    const minutes = Math.floor((Date.now() - new Date(value.replace(' ', 'T')).getTime()) / 60000);
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `há ${minutes} min`;
    if (minutes < 24 * 60) return `há ${Math.floor(minutes / 60)} h`;
    if (minutes < 7 * 24 * 60) return `há ${Math.floor(minutes / (24 * 60))} dia(s)`;
    return formatDateTime(value).slice(0, 10);
}

// Sininho no topo do site: avisos de reserva aprovada/recusada.
// Atualiza ao trocar de página e a cada minuto (não é em tempo real).
export default function NotificationBell() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const menuRef = useRef(null);

    const load = useCallback(() => {
        return getNotifications()
            .then((data) => {
                setNotifications(data.notifications);
                setUnreadCount(data.unread_count);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        load();
        const timer = setInterval(load, REFRESH_INTERVAL);
        return () => clearInterval(timer);
    }, [load, pathname]);

    // Fecha ao clicar fora ou apertar Esc (mesmo comportamento do UserMenu)
    useEffect(() => {
        if (!open) return;

        function handleClickOutside(event) {
            if (!menuRef.current?.contains(event.target)) setOpen(false);
        }
        function handleKeyDown(event) {
            if (event.key === 'Escape') setOpen(false);
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    function handleToggle() {
        setOpen((current) => !current);
        // Ao abrir, busca de novo para mostrar o que chegou desde a última atualização
        if (!open) load();
    }

    function handleOpenNotification(notification) {
        setOpen(false);
        if (!notification.read_at) {
            // Atualiza na tela na hora; se a API falhar, a próxima busca corrige
            setNotifications((current) => current.map((n) => (n.id === notification.id ? { ...n, read_at: 'agora' } : n)));
            setUnreadCount((count) => Math.max(0, count - 1));
            markNotificationAsRead(notification.id).catch(() => {});
        }
        navigate(`/reservations/${notification.data.reservation_id}`);
    }

    async function handleMarkAll() {
        setNotifications((current) => current.map((n) => ({ ...n, read_at: n.read_at ?? 'agora' })));
        setUnreadCount(0);
        try {
            await markAllNotificationsAsRead();
        } catch {
            load();
        }
    }

    const label = unreadCount > 0 ? `Notificações (${unreadCount} não lidas)` : 'Notificações';

    return (
        <div className="notification-bell" ref={menuRef}>
            <button
                type="button"
                className="notification-trigger"
                onClick={handleToggle}
                aria-haspopup="true"
                aria-expanded={open}
                aria-label={label}
                title={label}
            >
                <i className={unreadCount > 0 ? 'fa-solid fa-bell' : 'fa-regular fa-bell'} aria-hidden="true"></i>
                {unreadCount > 0 && <span className="notification-count" aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>

            {open && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <strong>Notificações</strong>
                        {unreadCount > 0 && (
                            <button type="button" className="btn btn-ghost btn-sm" onClick={handleMarkAll}>
                                Marcar todas como lidas
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <p className="notification-empty">
                            <i className="fa-regular fa-bell-slash" aria-hidden="true"></i>
                            Nenhuma notificação por enquanto. Quando uma solicitação sua for respondida, o aviso aparece aqui.
                        </p>
                    ) : (
                        <ul className="notification-list">
                            {notifications.map((notification) => {
                                const { data } = notification;
                                return (
                                    <li key={notification.id}>
                                        <button
                                            type="button"
                                            className={`notification-item notification-${data.status}${notification.read_at ? '' : ' is-unread'}`}
                                            onClick={() => handleOpenNotification(notification)}
                                        >
                                            <i className={ICONS[data.status] ?? 'fa-regular fa-bell'} aria-hidden="true"></i>
                                            <span className="notification-body">
                                                <span className="notification-message">{data.message}</span>
                                                <span className="notification-meta">
                                                    {data.title ? `${data.title} · ` : ''}{formatDateTime(data.start_at)}
                                                </span>
                                                {data.rejection_reason && (
                                                    <span className="notification-meta">Motivo: {data.rejection_reason}</span>
                                                )}
                                                <span className="notification-time">{timeAgo(notification.created_at)}</span>
                                            </span>
                                            {!notification.read_at && <span className="notification-dot" aria-label="Não lida"></span>}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
