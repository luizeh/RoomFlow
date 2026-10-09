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
     * Usuário comum vê só "ocupado" nas reservas dos outros (sem nome, e-mail ou id);
     * nas próprias reservas vem o id e is_mine = true.
     * Admin vê o nome de quem reservou em todas.
     */
    public function schedule(RoomScheduleRequest $request, Room $room)
    {
        Gate::authorize('view', $room);

        $user = $request->user();
        $isAdmin = $user->role === 'admin';

        // Reserva entra se começa antes do fim do período e termina depois do início
        // (pega também as que atravessam o começo ou o fim do período).
        $reservations = $room->reservations()
            ->with('user:id,name')
            ->where('start_at', '<', $request->date('end'))
            ->where('end_at', '>', $request->date('start'))
            ->orderBy('start_at')
            ->get();

        $schedule = $reservations->map(function (Reservation $reservation) use ($user, $isAdmin) {
            $isMine = $reservation->user()->is($user);

            $item = [
                'id' => ($isMine || $isAdmin) ? $reservation->id : null,
                'start_at' => $reservation->start_at->format('Y-m-d H:i:s'),
                'end_at' => $reservation->end_at->format('Y-m-d H:i:s'),
                'is_mine' => $isMine,
            ];

            if ($isAdmin) {
                $item['user'] = [
                    'id' => $reservation->user->id,
                    'name' => $reservation->user->name,
                ];
            }

            return $item;
        });

        return response()->json($schedule);
    }
}
