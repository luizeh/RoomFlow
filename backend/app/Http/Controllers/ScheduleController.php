<?php

namespace App\Http\Controllers;

use App\Http\Requests\RoomScheduleRequest;
use App\Models\Reservation;

// Agenda geral: reservas de todas as salas (ou das escolhidas em ?rooms[]=1&rooms[]=2) no período.
// Mesmas regras de visibilidade da agenda de uma sala (RoomController::schedule).
class ScheduleController extends Controller
{
    public function index(RoomScheduleRequest $request)
    {
        $user = $request->user();

        $reservations = Reservation::visibleInScheduleTo($user)
            ->with(['user:id,name', 'participants:id'])
            ->when($request->filled('rooms'), fn ($query) => $query->whereIn('room_id', $request->input('rooms')))
            ->where('start_at', '<', $request->date('end'))
            ->where('end_at', '>', $request->date('start'))
            ->orderBy('start_at')
            ->get();

        return response()->json(
            $reservations->map(fn (Reservation $reservation) => $reservation->toScheduleItem($user))
        );
    }
}
