// Situação da reserva: o cliente solicita (pending) e o admin aprova ou recusa.
const STATUS = {
    pending: { label: 'Pendente', icon: 'fa-regular fa-hourglass-half' },
    approved: { label: 'Aprovada', icon: 'fa-solid fa-check' },
    rejected: { label: 'Recusada', icon: 'fa-solid fa-xmark' },
};

export default function StatusBadge({ status }) {
    const info = STATUS[status];
    if (!info) return null;

    return (
        <span className={`badge badge-${status}`}>
            <i className={info.icon} aria-hidden="true"></i>
            {info.label}
        </span>
    );
}
