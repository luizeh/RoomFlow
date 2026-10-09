// Converte "2026-10-01T14:30:00.000000Z" ou "2026-10-01 14:30:00" para o formato do input datetime-local.
export function toDateTimeInput(value) {
    if (!value) return '';
    return String(value).replace(' ', 'T').slice(0, 16);
}

export function formatDateTime(value) {
    const input = toDateTimeInput(value);
    if (!input) return '';
    const [date, time] = input.split('T');
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year} ${time}`;
}

// Converte um Date para o formato que a API espera ("2026-10-01 14:30:00"), no horário local.
export function toApiDateTime(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export function formatTime(date) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Converte um Date para o formato do input type="date" ("2026-10-01"), no horário local.
export function toDateInput(date) {
    return toApiDateTime(date).slice(0, 10);
}
