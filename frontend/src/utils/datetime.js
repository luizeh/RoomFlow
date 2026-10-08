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
