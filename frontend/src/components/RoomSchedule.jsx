import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import listPlugin from '@fullcalendar/react/list';
import interactionPlugin from '@fullcalendar/react/interaction';
import classicThemePlugin from '@fullcalendar/react/themes/classic';
import ptBrLocale from '@fullcalendar/react/locales/pt-br';
import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/theme.css';
import '@fullcalendar/react/themes/classic/palette.css';
import '../styles/schedule.css';
import { getRoomSchedule, getSchedule } from '../services/rooms';
import { createReservation } from '../services/reservations';
import { deleteAdminReservation, updateAdminReservation } from '../services/admin';
import { actionDialog, confirmDialog, notify, selectDialog } from '../utils/alerts';
import { formatTime, toApiDateTime, toDateInput } from '../utils/datetime';
import { roomColor } from '../utils/roomColors';

// Precisam ser cores fixas (o FullCalendar aplica direto no evento).
// As mesmas cores estão na legenda, em schedule.css.
const EVENT_COLORS = { busy: '#3f3f46', mine: '#e4e4e7', guest: '#a1a1aa', pending: '#fbbf24' };

// Texto do evento: admin vê quem reservou; o usuário vê o título das reservas dele e das que foi convidado.
function eventTitle(item, isAdmin) {
    const pending = item.status === 'pending';
    if (isAdmin) {
        const name = item.title ? `${item.user.name}: ${item.title}` : item.user.name;
        return pending ? `Pendente · ${name}` : name;
    }
    if (item.is_mine) return pending ? `Aguardando aprovação · ${item.title || 'Sua solicitação'}` : item.title || 'Sua reserva';
    if (item.is_participant) return `${pending ? 'Aguardando · ' : ''}Convidado${item.title ? `: ${item.title}` : ''}`;
    return 'Ocupado';
}

function eventColor(item) {
    if (item.status === 'pending') return EVENT_COLORS.pending;
    if (item.is_mine) return EVENT_COLORS.mine;
    if (item.is_participant) return EVENT_COLORS.guest;
    return EVENT_COLORS.busy;
}

const isSmallScreen = () => window.matchMedia('(max-width: 700px)').matches;

function describeSlot(start, end) {
    const day = start.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
    return `${day}, das ${formatTime(start)} às ${formatTime(end)}`;
}

function errorMessage(err, fallback) {
    return err.validationErrors ? Object.values(err.validationErrors).flat().join(' ') : err.message || fallback;
}

// Agenda das salas: mostra os horários ocupados e deixa o usuário clicar/arrastar
// num horário livre para solicitar uma reserva (o admin aprova depois).
//
// room: agenda de uma sala só.
// rooms (sem room): agenda geral com as salas da lista; roomIds filtra quais aparecem.
// manage (painel admin, só com room): o admin pode arrastar/redimensionar qualquer reserva
// para mudar o horário, e clicar nela para editar ou excluir.
// onChange: chamado depois de criar, mover ou excluir uma reserva.
// reloadKey: quando muda, a agenda busca as reservas de novo (ex.: excluiu pela tabela).
export default function RoomSchedule({ room, rooms = [], roomIds, user, manage = false, onChange, reloadKey }) {
    const navigate = useNavigate();
    const calendarRef = useRef(null);
    const [loadError, setLoadError] = useState(null);
    const [viewType, setViewType] = useState(null);
    // Data mostrada no campo "ir para a data" (acompanha as setas e o botão Hoje)
    const [currentDate, setCurrentDate] = useState(() => toDateInput(new Date()));
    // Em modo de desenvolvimento o React monta o componente duas vezes; a busca feita
    // pela montagem descartada não pode mexer no estado (gera aviso no console).
    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);
    const isAdmin = user.role === 'admin';
    const isGeneral = !room;
    const canManage = manage && isAdmin && !isGeneral;

    // Filtro da agenda geral fica num ref: assim fetchEvents não muda e o FullCalendar
    // não busca duas vezes; quem dispara a nova busca é o efeito logo abaixo.
    const roomIdsRef = useRef(roomIds);
    const roomsRef = useRef(rooms);
    // Sem lista de dependências: roda depois de toda renderização, mantendo os refs atualizados
    useEffect(() => {
        roomIdsRef.current = roomIds;
        roomsRef.current = rooms;
    });
    const roomIdsKey = roomIds?.join(',') ?? '';
    const filterMountedRef = useRef(false);
    useEffect(() => {
        // Na primeira vez o próprio FullCalendar já busca; só recarrega quando o filtro muda
        if (!filterMountedRef.current) {
            filterMountedRef.current = true;
            return;
        }
        calendarRef.current?.getApi().refetchEvents();
    }, [roomIdsKey]);

    // Alguém de fora (ex.: tabela do painel) pediu para recarregar
    useEffect(() => {
        if (reloadKey === undefined) return;
        calendarRef.current?.getApi().refetchEvents();
    }, [reloadKey]);

    // Busca as reservas do período visível sempre que o usuário troca de semana/dia/mês.
    // useCallback: se a função mudasse a cada render, o FullCalendar buscaria tudo de novo.
    const fetchEvents = useCallback(async (info) => {
        try {
            const start = toApiDateTime(info.start);
            const end = toApiDateTime(info.end);
            const schedule = room
                ? await getRoomSchedule(room.id, start, end)
                : await getSchedule(start, end, roomIdsRef.current);
            if (mountedRef.current) setLoadError(null);

            return schedule.map((item) => {
                const roomIndex = roomsRef.current.findIndex((r) => r.id === item.room_id);
                const roomName = roomsRef.current[roomIndex]?.name;
                const title = eventTitle(item, isAdmin);
                const color = eventColor(item);
                return {
                    id: item.id ? String(item.id) : undefined,
                    start: item.start_at.replace(' ', 'T'),
                    end: item.end_at.replace(' ', 'T'),
                    // Na agenda geral o nome da sala vem na frente e a borda tem a cor da sala
                    title: room || !roomName ? title : `${roomName} · ${title}`,
                    backgroundColor: color,
                    borderColor: room || roomIndex < 0 ? color : roomColor(roomIndex),
                    contrastColor: color === EVENT_COLORS.busy ? '#f5f5f5' : '#0b0b0c',
                    classNames: [`event-${item.status}`, ...(room ? [] : ['event-room'])],
                    extendedProps: {
                        reservationId: item.id,
                        isMine: item.is_mine,
                        status: item.status,
                        userName: item.user?.name,
                    },
                };
            });
        } catch (err) {
            if (mountedRef.current) setLoadError(err.message || 'Erro ao carregar a agenda.');
            return [];
        }
    }, [room, isAdmin]);

    // Campo de data na barra da agenda: pula direto para a semana/dia escolhido
    function handleDatePick(event) {
        if (!event.target.value) return;
        setCurrentDate(event.target.value);
        calendarRef.current.getApi().gotoDate(event.target.value);
    }

    // Mantém o campo de data e a dica iguais ao que a agenda está mostrando
    function handleDatesSet(info) {
        if (!mountedRef.current) return;
        const date = calendarRef.current?.getApi().getDate();
        if (date) setCurrentDate(toDateInput(date));
        setViewType(info.view.type);
    }

    const datePicker = (
        <label className="schedule-date-picker" title="Ir para a data">
            <span className="sr-only">Ir para a data</span>
            <input type="date" value={currentDate} onChange={handleDatePick} />
        </label>
    );

    // Não deixa selecionar horário que já começou, nem o dia inteiro (visão de mês)
    function allowSelection(span) {
        return !span.allDay && span.start >= new Date();
    }

    // Pendentes não ocupam a sala, então dá para selecionar por cima delas.
    // Na agenda geral os eventos são de várias salas: quem confere o conflito é o backend.
    function allowSelectOverlap(event) {
        return isGeneral || event.extendedProps.status === 'pending';
    }

    // Na visão de mês, clicar num dia abre a agenda daquele dia (onde dá para escolher o horário)
    function handleDateClick(info) {
        if (info.view.type !== 'dayGridMonth') return;
        calendarRef.current.getApi().changeView('timeGridDay', info.date);
    }

    // Agenda geral: pergunta a sala. Se o filtro tem uma sala só, usa ela direto.
    async function pickRoom(info) {
        const available = roomIds?.length ? rooms.filter((r) => roomIds.includes(r.id)) : rooms;
        if (available.length === 1) return available[0];

        const options = Object.fromEntries(available.map((r) => [r.id, r.name]));
        const chosen = await selectDialog({
            title: isAdmin ? 'Reservar horário' : 'Solicitar horário',
            text: `Escolha a sala para ${describeSlot(info.start, info.end)}.`,
            options,
            placeholder: 'Escolha a sala',
            confirmText: 'Continuar',
        });
        return chosen ? rooms.find((r) => String(r.id) === String(chosen)) : null;
    }

    async function handleSelect(info) {
        const calendar = calendarRef.current.getApi();

        const targetRoom = room ?? await pickRoom(info);
        if (!targetRoom) {
            calendar.unselect();
            return;
        }

        // Admin reserva direto; cliente envia uma solicitação para aprovação
        const confirmed = await confirmDialog(isAdmin ? {
            title: 'Confirmar reserva?',
            text: `${targetRoom.name}, ${describeSlot(info.start, info.end)}. A reserva fica no seu nome e já entra aprovada.`,
            icon: 'question',
            confirmText: 'Reservar',
        } : {
            title: 'Enviar solicitação?',
            text: `${targetRoom.name}, ${describeSlot(info.start, info.end)}. Um administrador vai analisar o pedido e você recebe um e-mail com a resposta.`,
            icon: 'question',
            confirmText: 'Enviar solicitação',
        });

        if (!confirmed) {
            calendar.unselect();
            return;
        }

        try {
            await createReservation({
                room_id: targetRoom.id,
                start_at: toApiDateTime(info.start),
                end_at: toApiDateTime(info.end),
            });
            notify(isAdmin ? 'Reserva confirmada!' : 'Solicitação enviada! Aguarde a aprovação.');
            onChange?.();
        } catch (err) {
            notify(errorMessage(err, 'Erro ao enviar a solicitação.'), 'error');
        } finally {
            calendar.unselect();
            // Recarrega mesmo se der erro: alguém pode ter reservado o horário nesse meio-tempo
            calendar.refetchEvents();
        }
    }

    // Clicar numa reserva abre os detalhes (as próprias e as que foi convidado, ou qualquer uma para o admin).
    // No painel admin, abre as opções de editar e excluir.
    function handleEventClick(info) {
        const { reservationId, isMine } = info.event.extendedProps;
        if (!reservationId) return;
        if (canManage) {
            openManageDialog(info.event);
            return;
        }
        if (isAdmin && !isMine) navigate(`/admin/reservations/${reservationId}/edit`);
        else navigate(`/reservations/${reservationId}`);
    }

    async function openManageDialog(event) {
        const { reservationId, userName, status } = event.extendedProps;
        const action = await actionDialog({
            title: `Reserva #${reservationId}`,
            text: `${userName}, ${describeSlot(event.start, event.end)}.${status === 'pending' ? ' Aguardando aprovação.' : ''}`,
            confirmText: 'Editar',
            denyText: 'Excluir',
        });

        if (action === 'confirm') {
            navigate(`/admin/reservations/${reservationId}/edit`);
            return;
        }
        if (action !== 'deny') return;

        const confirmed = await confirmDialog({
            title: 'Excluir reserva?',
            text: `A reserva de ${userName} (${describeSlot(event.start, event.end)}) será excluída. Essa ação não pode ser desfeita.`,
            confirmText: 'Excluir',
            danger: true,
        });
        if (!confirmed) return;

        try {
            await deleteAdminReservation(reservationId);
            event.remove();
            notify('Reserva excluída.');
            onChange?.();
        } catch (err) {
            notify(errorMessage(err, 'Erro ao excluir a reserva.'), 'error');
            calendarRef.current.getApi().refetchEvents();
        }
    }

    // Admin arrastou a reserva para outro horário ou mudou a duração
    async function handleEventMove(info) {
        const { event, revert } = info;
        const { reservationId, userName } = event.extendedProps;

        const confirmed = await confirmDialog({
            title: 'Mudar horário?',
            text: `A reserva de ${userName} passa para ${describeSlot(event.start, event.end)}.`,
            icon: 'question',
            confirmText: 'Salvar',
        });
        if (!confirmed) {
            revert();
            return;
        }

        try {
            await updateAdminReservation(reservationId, {
                room_id: room.id,
                start_at: toApiDateTime(event.start),
                end_at: toApiDateTime(event.end),
            });
            notify('Horário atualizado.');
            onChange?.();
        } catch (err) {
            revert();
            notify(errorMessage(err, 'Erro ao mudar o horário.'), 'error');
        }
    }

    const isMonth = viewType === 'dayGridMonth';
    const isList = viewType?.startsWith('list');

    return (
        <div className="room-schedule">
            {/* Dica de como agendar, sempre visível acima da agenda */}
            <div className="schedule-hint">
                <i className="fa-regular fa-hand-pointer" aria-hidden="true"></i>
                <p>
                    {isMonth && <>Clique em um dia para abrir a agenda dele. </>}
                    {isList && <>Volte para <strong>Semana</strong> ou <strong>Dia</strong> para escolher um horário. </>}
                    {!isMonth && !isList && (
                        <><strong>Clique e arraste</strong> em um horário livre{isGeneral ? ' e escolha a sala' : ''} para {isAdmin ? 'reservar' : 'solicitar uma reserva'}. </>
                    )}
                    {isAdmin
                        ? 'Suas reservas já entram aprovadas.'
                        : <>A solicitação fica <strong>pendente</strong> até um administrador aprovar, e você recebe a resposta por e-mail.</>}
                </p>
            </div>

            {loadError && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{loadError}</p>}
            <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin, classicThemePlugin]}
                locale={ptBrLocale}
                colorScheme="dark"
                initialView={isSmallScreen() ? 'timeGridDay' : 'timeGridWeek'}
                headerToolbar={{ start: 'prev,next today datePicker', center: 'title', end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }}
                toolbarElements={{ datePicker }}
                datesSet={handleDatesSet}
                height="auto"
                allDaySlot={false}
                slotMinTime="07:00:00"
                slotMaxTime="22:00:00"
                slotDuration="00:30:00"
                scrollTime="08:00:00"
                businessHours={{ daysOfWeek: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '18:00' }}
                nowIndicator
                dayMaxEvents={3}
                noEventsText="Nenhuma reserva neste período."
                events={fetchEvents}
                selectable
                selectMirror
                selectOverlap={allowSelectOverlap}
                selectAllow={allowSelection}
                selectLongPressDelay={300}
                select={handleSelect}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                editable={canManage}
                eventOverlap={(stillEvent) => stillEvent.extendedProps.status === 'pending'}
                eventDrop={handleEventMove}
                eventResize={handleEventMove}
                eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                slotHeaderFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            />
            <ul className="schedule-legend">
                <li><span className="schedule-legend-swatch schedule-legend-free"></span>Livre</li>
                <li><span className="schedule-legend-swatch schedule-legend-busy"></span>{isAdmin ? 'Aprovada (nome de quem reservou)' : 'Ocupado'}</li>
                <li><span className="schedule-legend-swatch schedule-legend-mine"></span>Sua reserva</li>
                {!isAdmin && <li><span className="schedule-legend-swatch schedule-legend-guest"></span>Você foi convidado</li>}
                <li><span className="schedule-legend-swatch schedule-legend-pending"></span>Aguardando aprovação</li>
                {isGeneral && <li><span className="schedule-legend-swatch schedule-legend-room"></span>A borda colorida indica a sala</li>}
                {canManage && <li><i className="fa-solid fa-up-down-left-right" aria-hidden="true"></i>Arraste uma reserva para mudar o horário; clique para editar ou excluir</li>}
            </ul>
        </div>
    );
}
