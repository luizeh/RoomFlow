import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import interactionPlugin from '@fullcalendar/react/interaction';
import classicThemePlugin from '@fullcalendar/react/themes/classic';
import ptBrLocale from '@fullcalendar/react/locales/pt-br';
import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/theme.css';
import '@fullcalendar/react/themes/classic/palette.css';
import '../styles/schedule.css';
import { getRoomSchedule } from '../services/rooms';
import { createReservation } from '../services/reservations';
import { deleteAdminReservation, updateAdminReservation } from '../services/admin';
import { actionDialog, confirmDialog, notify } from '../utils/alerts';
import { formatTime, toApiDateTime, toDateInput } from '../utils/datetime';

// Precisam ser cores fixas (o FullCalendar aplica direto no evento)
const EVENT_COLORS = { busy: '#3f3f46', mine: '#e4e4e7' };

const isSmallScreen = () => window.matchMedia('(max-width: 700px)').matches;

function describeSlot(start, end) {
    const day = start.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
    return `${day}, das ${formatTime(start)} às ${formatTime(end)}`;
}

function errorMessage(err, fallback) {
    return err.validationErrors ? Object.values(err.validationErrors).flat().join(' ') : err.message || fallback;
}

// Agenda semanal da sala: mostra os horários ocupados e deixa o usuário
// clicar/arrastar num horário livre para reservar.
//
// manage (painel admin): o admin pode arrastar/redimensionar qualquer reserva para mudar
// o horário, e clicar nela para editar ou excluir.
// onChange: chamado depois de criar, mover ou excluir uma reserva.
// reloadKey: quando muda, a agenda busca as reservas de novo (ex.: excluiu pela tabela).
export default function RoomSchedule({ room, user, manage = false, onChange, reloadKey }) {
    const navigate = useNavigate();
    const calendarRef = useRef(null);
    const [loadError, setLoadError] = useState(null);
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
    const canManage = manage && isAdmin;

    // Alguém de fora (ex.: tabela do painel) pediu para recarregar
    useEffect(() => {
        if (reloadKey === undefined) return;
        calendarRef.current?.getApi().refetchEvents();
    }, [reloadKey]);

    // Busca as reservas da semana visível sempre que o usuário troca de semana/dia.
    // useCallback: se a função mudasse a cada render, o FullCalendar buscaria tudo de novo.
    const fetchEvents = useCallback(async (info) => {
        try {
            const schedule = await getRoomSchedule(room.id, toApiDateTime(info.start), toApiDateTime(info.end));
            if (mountedRef.current) setLoadError(null);
            return schedule.map((item) => ({
                id: item.id ? String(item.id) : undefined,
                start: item.start_at.replace(' ', 'T'),
                end: item.end_at.replace(' ', 'T'),
                title: isAdmin ? item.user.name : item.is_mine ? 'Sua reserva' : 'Ocupado',
                // Ocupado: cinza escuro. Sua reserva: claro (mesma cor dos botões principais).
                color: item.is_mine ? EVENT_COLORS.mine : EVENT_COLORS.busy,
                contrastColor: item.is_mine ? '#0b0b0c' : '#f5f5f5',
                extendedProps: { reservationId: item.id, isMine: item.is_mine, userName: item.user?.name },
            }));
        } catch (err) {
            if (mountedRef.current) setLoadError(err.message || 'Erro ao carregar a agenda.');
            return [];
        }
    }, [room.id, isAdmin]);

    // Campo de data na barra da agenda: pula direto para a semana/dia escolhido
    function handleDatePick(event) {
        if (!event.target.value) return;
        setCurrentDate(event.target.value);
        calendarRef.current.getApi().gotoDate(event.target.value);
    }

    // Mantém o campo de data igual ao que a agenda está mostrando
    function handleDatesSet() {
        const date = calendarRef.current?.getApi().getDate();
        if (date && mountedRef.current) setCurrentDate(toDateInput(date));
    }

    const datePicker = (
        <label className="schedule-date-picker" title="Ir para a data">
            <span className="sr-only">Ir para a data</span>
            <input type="date" value={currentDate} onChange={handleDatePick} />
        </label>
    );

    // Não deixa selecionar horário que já começou
    function allowSelection(span) {
        return span.start >= new Date();
    }

    async function handleSelect(info) {
        const calendar = calendarRef.current.getApi();

        const confirmed = await confirmDialog({
            title: 'Confirmar reserva?',
            text: `${room.name}, ${describeSlot(info.start, info.end)}.${canManage ? ' A reserva fica no seu nome.' : ''}`,
            icon: 'question',
            confirmText: 'Reservar',
        });

        if (!confirmed) {
            calendar.unselect();
            return;
        }

        try {
            await createReservation({
                room_id: room.id,
                start_at: toApiDateTime(info.start),
                end_at: toApiDateTime(info.end),
            });
            notify('Reserva confirmada!');
            onChange?.();
        } catch (err) {
            notify(errorMessage(err, 'Erro ao criar a reserva.'), 'error');
        } finally {
            calendar.unselect();
            // Recarrega mesmo se der erro: alguém pode ter reservado o horário nesse meio-tempo
            calendar.refetchEvents();
        }
    }

    // Clicar numa reserva abre os detalhes (só as próprias, ou qualquer uma para o admin).
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
        const { reservationId, userName } = event.extendedProps;
        const action = await actionDialog({
            title: `Reserva #${reservationId}`,
            text: `${userName}, ${describeSlot(event.start, event.end)}.`,
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

    return (
        <div className="room-schedule">
            {loadError && <p className="alert alert-error" role="alert"><i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{loadError}</p>}
            <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, interactionPlugin, classicThemePlugin]}
                locale={ptBrLocale}
                colorScheme="dark"
                initialView={isSmallScreen() ? 'timeGridDay' : 'timeGridWeek'}
                headerToolbar={{ start: 'prev,next today datePicker', center: 'title', end: 'timeGridWeek,timeGridDay' }}
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
                events={fetchEvents}
                selectable
                selectMirror
                selectOverlap={false}
                selectAllow={allowSelection}
                selectLongPressDelay={300}
                select={handleSelect}
                eventClick={handleEventClick}
                editable={canManage}
                eventOverlap={false}
                eventDrop={handleEventMove}
                eventResize={handleEventMove}
                eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                slotHeaderFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            />
            <ul className="schedule-legend">
                <li><span className="schedule-legend-swatch schedule-legend-free"></span>Livre: clique ou arraste para reservar</li>
                <li><span className="schedule-legend-swatch schedule-legend-busy"></span>{isAdmin ? 'Reservado (nome de quem reservou)' : 'Ocupado'}</li>
                <li><span className="schedule-legend-swatch schedule-legend-mine"></span>Sua reserva</li>
                {canManage && <li><i className="fa-solid fa-up-down-left-right" aria-hidden="true"></i>Arraste uma reserva para mudar o horário; clique para editar ou excluir</li>}
            </ul>
        </div>
    );
}
