import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// Card do usuário no topo: avatar com a inicial e menu com Perfil e Sair
export default function UserMenu({ user, onLogout }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    // Fecha ao clicar fora ou apertar Esc
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

    function handleLogout() {
        setOpen(false);
        onLogout();
    }

    const initial = user.name?.charAt(0).toUpperCase();

    return (
        <div className="user-menu" ref={menuRef}>
            <button
                type="button"
                className="user-menu-trigger"
                onClick={() => setOpen((current) => !current)}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <span className="user-avatar">{initial}</span>
                <span className="user-menu-name">{user.name}</span>
                <i className={`fa-solid fa-chevron-down user-menu-chevron${open ? ' is-open' : ''}`} aria-hidden="true"></i>
            </button>

            {open && (
                <div className="user-menu-dropdown" role="menu">
                    <div className="user-menu-header">
                        <span className="user-avatar user-avatar-lg">{initial}</span>
                        <div className="user-menu-info">
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
                        </div>
                    </div>
                    <Link to="/profile" className="user-menu-item" role="menuitem" onClick={() => setOpen(false)}>
                        <i className="fa-regular fa-user" aria-hidden="true"></i> Perfil
                    </Link>
                    <button type="button" className="user-menu-item user-menu-item-danger" role="menuitem" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Sair
                    </button>
                </div>
            )}
        </div>
    );
}
