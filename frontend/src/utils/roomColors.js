// Cor de cada sala na agenda geral (borda do evento e bolinha do filtro).
// Fica fora do RoomSchedule para a página da agenda não carregar o FullCalendar só por causa disso.
const ROOM_COLORS = ['#60a5fa', '#f472b6', '#34d399', '#c084fc', '#fb923c', '#38bdf8', '#a3e635', '#f87171'];

export function roomColor(index) {
    return ROOM_COLORS[index % ROOM_COLORS.length];
}
