<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
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

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('rooms', 'public');
        }   

        return response()->json(Room::create($data), 201);
    }

    public function update(RoomRequest $request, Room $room)
    {
        Gate::authorize('update', $room);

        $data = $request->validated();

        $oldImage = $room->image_path;

        if ($request->hasFile('image')) {
            if ($room->image_path) {
                Storage::disk('public')->delete($room->image_path);
            }

            $data['image_path'] = $request->file('image')->store('rooms', 'public');
        }

        $room->update($data);

        if ($oldImage && isset($data['image_path'])) {
            Storage::disk('public')->delete($oldImage);
        }       

        return response()->json($room);
    }

    public function destroy(Room $room)
    {
        Gate::authorize('delete', $room);

        if ($room->image_path) {
            Storage::disk('public')->delete($room->image_path);
        }

        $room->delete();

        return response()->noContent();
    }
}
