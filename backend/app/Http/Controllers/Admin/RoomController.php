<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Http\Requests\RoomRequest;
use App\Models\Room;

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

    public function store(RoomRequest $request)
    {
        Gate::authorize('create', Room::class);

        $data = $request->validated();

        return response()->json(Room::create($data), 201);
    }

    public function update(RoomRequest $request, Room $room)
    {
        Gate::authorize('update', $room);

        $data = $request->validated();

        $room->update($data);

        return response()->json($room);
    }

    public function destroy(Room $room)
    {
        Gate::authorize('delete', $room);

        $room->delete();

        return response()->noContent();
    }
}
