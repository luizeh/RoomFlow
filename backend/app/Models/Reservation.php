<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'room_id', 'start_at', 'end_at'])]
class Reservation extends Model
{
    /**
     * start_at e end_at viram objetos de data (Carbon) no PHP.
     * O formato ':Y-m-d H:i:s' mantém o JSON igual ao que o banco guarda
     * (ex.: "2026-10-08 14:00:00"), sem converter para UTC.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_at' => 'datetime:Y-m-d H:i:s',
            'end_at' => 'datetime:Y-m-d H:i:s',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}
