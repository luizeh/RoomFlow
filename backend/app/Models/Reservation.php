<?php

namespace App\Models;

use App\Enums\ReservationStatus;
use App\Notifications\ReservationReviewed;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Avisa o editor que os scopes podem ser chamados assim (o Laravel cria isso sozinho):
 * @method static Builder<static> visibleTo(User $user)
 * @method static Builder<static> visibleInScheduleTo(User $user)
 * @method static Builder<static> approved()
 * @method static Builder<static> overlapping(int $roomId, mixed $startAt, mixed $endAt)
 */
// status, rejection_reason e reviewed_* ficam fora do fillable: só mudam pelos métodos
// approve(), reject() e markPending(), nunca direto com dados vindos do cliente.
#[Fillable(['user_id', 'room_id', 'title', 'start_at', 'end_at'])]
#[Hidden(['share_token'])]
class Reservation extends Model
{
    /**
     * Toda reserva nova começa pendente (o mesmo valor padrão da coluna no banco).
     */
    protected $attributes = [
        'status' => 'pending',
    ];

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
            'status' => ReservationStatus::class,
            'reviewed_at' => 'datetime:Y-m-d H:i:s',
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

    /**
     * Admin que aprovou ou recusou a reserva.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
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

    /**
     * Só as reservas aprovadas (as que realmente ocupam a sala).
     */
    #[Scope]
    protected function approved(Builder $query): void
    {
        $query->where('status', ReservationStatus::Approved);
    }

    /**
     * Reservas da sala que se sobrepõem ao período: começam antes do fim e terminam depois do início.
     */
    #[Scope]
    protected function overlapping(Builder $query, int $roomId, mixed $startAt, mixed $endAt): void
    {
        $query->where('room_id', $roomId)
            ->where('start_at', '<', $endAt)
            ->where('end_at', '>', $startAt);
    }

    /**
     * Reservas que aparecem na agenda para o usuário.
     * Recusadas nunca aparecem. Admin vê aprovadas e pendentes de todos;
     * usuário comum vê as aprovadas e as pendentes que criou ou foi convidado.
     */
    #[Scope]
    protected function visibleInScheduleTo(Builder $query, User $user): void
    {
        $query->where('status', '!=', ReservationStatus::Rejected);

        if ($user->role === 'admin') {
            return;
        }

        $query->where(function (Builder $query) use ($user) {
            $query->where('status', ReservationStatus::Approved)
                ->orWhere('user_id', $user->id)
                ->orWhereHas('participants', fn (Builder $q) => $q->where('users.id', $user->id));
        });
    }

    /**
     * Já existe outra reserva aprovada nesse horário e sala?
     */
    public function hasApprovedConflict(): bool
    {
        return static::query()->approved()
            ->overlapping($this->room_id, $this->start_at, $this->end_at)
            ->whereKeyNot($this->id)
            ->exists();
    }

    /**
     * Aprova a reserva e recusa automaticamente as pendentes que batem com o mesmo horário.
     * Retorna as reservas recusadas, para o controller avisar os donos por e-mail.
     *
     * @return Collection<int, Reservation>
     */
    public function approve(User $admin): Collection
    {
        return DB::transaction(function () use ($admin) {
            $this->forceFill([
                'status' => ReservationStatus::Approved,
                'rejection_reason' => null,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ])->save();

            $conflicts = static::query()->where('status', ReservationStatus::Pending)
                ->overlapping($this->room_id, $this->start_at, $this->end_at)
                ->whereKeyNot($this->id)
                ->get();

            foreach ($conflicts as $conflict) {
                $conflict->reject($admin, 'O horário foi aprovado para outra solicitação.');
            }

            return $conflicts;
        });
    }

    public function reject(User $admin, ?string $reason = null): void
    {
        $this->forceFill([
            'status' => ReservationStatus::Rejected,
            'rejection_reason' => $reason,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
        ])->save();
    }

    /**
     * Volta para a fila de aprovação (ex.: o cliente mudou o horário de uma reserva aprovada).
     */
    public function markPending(): void
    {
        $this->forceFill([
            'status' => ReservationStatus::Pending,
            'rejection_reason' => null,
            'reviewed_by' => null,
            'reviewed_at' => null,
        ])->save();
    }

    /**
     * Avisa o dono por e-mail que a reserva foi aprovada ou recusada.
     * rescue(): se o envio de e-mail falhar, registra no log mas não derruba a requisição.
     */
    public function notifyOwner(): void
    {
        rescue(fn () => $this->user->notify(new ReservationReviewed($this)));
    }

    /**
     * Item da agenda para quem está vendo. Precisa de user e participants carregados.
     * Usuário comum vê só "ocupado" nas reservas dos outros (sem nome, título ou id).
     */
    public function toScheduleItem(User $viewer): array
    {
        $isAdmin = $viewer->role === 'admin';
        $isMine = $this->user_id === $viewer->id;
        $isParticipant = $this->participants->contains('id', $viewer->id);
        $canSee = $isMine || $isParticipant || $isAdmin;

        $item = [
            'id' => $canSee ? $this->id : null,
            'room_id' => $this->room_id,
            'title' => $canSee ? $this->title : null,
            'status' => $this->status->value,
            'start_at' => $this->start_at->format('Y-m-d H:i:s'),
            'end_at' => $this->end_at->format('Y-m-d H:i:s'),
            'is_mine' => $isMine,
            'is_participant' => $isParticipant,
        ];

        if ($isAdmin) {
            $item['user'] = [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ];
        }

        return $item;
    }
}
