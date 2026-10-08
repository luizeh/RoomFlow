<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Gate;
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
}
