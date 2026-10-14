<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Avisa o editor que o scope visibleTo() pode ser chamado assim (o Laravel cria isso sozinho):
 * @method static Builder<static> visibleTo(User $user)
 */
#[Fillable(['user_id', 'room_id', 'title', 'start_at', 'end_at'])]
#[Hidden(['share_token'])]
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

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'reservation_participants'
        )->withTimestamps();
    }

    public function hasParticipant(User $user): bool
    {
        return $this->participants()
            ->where('users.id', $user->id)
            ->exists();
    }

    /**
     * Reservas que o usuário pode ver: as que ele criou e as que ele foi convidado.
     * Uso: Reservation::visibleTo($user)->get()
     */
    #[Scope]
    protected function visibleTo(Builder $query, User $user): void
    {
        // O where(function ...) coloca as duas condições entre parênteses no SQL.
        // Sem ele, um ->where() encadeado depois ficaria fora do OR e a consulta sairia errada.
        $query->where(function (Builder $query) use ($user) {
            $query->where('user_id', $user->id)
                ->orWhereHas('participants', fn (Builder $q) => $q->where('users.id', $user->id));
        });
    }
}
