<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'capacity', 'location', 'description'])]
class Room extends Model
{
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }
}
