<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Gate;
use App\Http\Requests\RoomScheduleRequest;
use App\Models\Reservation;
use App\Models\Room;

// Salas para as telas públicas e de usuário: só visualização.
// Criar, editar e excluir ficam no Admin\RoomController.
class RoomController extends Controller
{
    public function index()
    {
        Gate::authorize('viewAny', Room::class);

        $rooms = Room::all();

        return response()->json($rooms);
    }

    public function show(Room $room)
    {
        Gate::authorize('view', $room);

        return response()->json($room);
    }

    /**
     * Agenda da sala: reservas que caem no período pedido (?start=...&end=...).
     *
     * Usuário comum vê só "ocupado" nas reservas aprovadas dos outros (sem nome, e-mail ou id);
     * nas próprias reservas e nos convites vem o id, o título e o status.
     * Admin vê todas (aprovadas e pendentes) com o nome de quem reservou.
     * O formato de cada item fica em Reservation::toScheduleItem().
     */
    public function schedule(RoomScheduleRequest $request, Room $room)
    {
        Gate::authorize('view', $room);

        $user = $request->user();

        // Reserva entra se começa antes do fim do período e termina depois do início
        // (pega também as que atravessam o começo ou o fim do período).
        $reservations = $room->reservations()
            ->visibleInScheduleTo($user)
            ->with(['user:id,name', 'participants:id'])
            ->where('start_at', '<', $request->date('end'))
            ->where('end_at', '>', $request->date('start'))
            ->orderBy('start_at')
            ->get();

        return response()->json(
            $reservations->map(fn (Reservation $reservation) => $reservation->toScheduleItem($user))
        );
    }
}
