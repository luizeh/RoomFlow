<?php

namespace App\Http\Controllers;
use App\Models\Reservation;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class ReservationShareController extends Controller
{
    public function store(Reservation $reservation)
    {
        Gate::authorize('share', $reservation);

        if (! $reservation->share_token) {
            $reservation->forceFill([
                'share_token' => Str::random(40),
            ])->save();
        }

        return response()->json([
            'share_token' => $reservation->share_token,
        ]);
    }

    public function destroy(Reservation $reservation)
    {
        Gate::authorize('share', $reservation);

        $reservation->forceFill([
            'share_token' => null,
        ])->save();

        return response()->noContent();
    }

    public function show(string $token)
    {
        $reservation = Reservation::with([
            'room',
            'user:id,name',
        ])
            ->where('share_token', $token)
            ->firstOrFail();

        return response()->json([
            'title' => $reservation->title,
            'start_at' => $reservation->start_at->format('Y-m-d H:i:s'),
            'end_at' => $reservation->end_at->format('Y-m-d H:i:s'),
            'host' => $reservation->user->name,
            'room' => [
                'name' => $reservation->room->name,
                'location' => $reservation->room->location,
                'image_url' => $reservation->room->image_url,
            ],
        ]);
    }
}

